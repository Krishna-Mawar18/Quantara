import pandas as pd
import numpy as np
import pickle
import base64
from sklearn.model_selection import (
    train_test_split,
    cross_val_score,
    StratifiedKFold,
    KFold,
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    RandomForestRegressor,
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    AdaBoostClassifier,
    AdaBoostRegressor,
    ExtraTreesClassifier,
    ExtraTreesRegressor,
)
from sklearn.linear_model import (
    LogisticRegression,
    LinearRegression,
    Ridge,
    Lasso,
    ElasticNet,
    SGDClassifier,
    SGDRegressor,
)
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import (
    accuracy_score,
    r2_score,
    mean_squared_error,
    classification_report,
    confusion_matrix,
)
from typing import Any


def _to_native(val):
    if val is None:
        return None
    if isinstance(val, float) and (val != val):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        f = float(val)
        return f if f == f else None
    if isinstance(val, np.ndarray):
        return [_to_native(v) for v in val]
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, (pd.Timestamp,)):
        return str(val)
    return val


CLASSIFICATION_MODELS = {
    "random_forest": {
        "class": RandomForestClassifier,
        "params": {
            "n_estimators": {"type": "int", "default": 200, "min": 10, "max": 500},
            "max_depth": {"type": "int", "default": 20, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
            "max_features": {
                "type": "select",
                "default": "sqrt",
                "options": ["sqrt", "log2", "None"],
            },
        },
    },
    "gradient_boosting": {
        "class": GradientBoostingClassifier,
        "params": {
            "n_estimators": {"type": "int", "default": 150, "min": 10, "max": 500},
            "learning_rate": {"type": "float", "default": 0.1, "min": 0.01, "max": 1.0},
            "max_depth": {"type": "int", "default": 5, "min": 1, "max": 20},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "subsample": {"type": "float", "default": 0.9, "min": 0.1, "max": 1.0},
        },
    },
    "extra_trees": {
        "class": ExtraTreesClassifier,
        "params": {
            "n_estimators": {"type": "int", "default": 200, "min": 10, "max": 500},
            "max_depth": {"type": "int", "default": 20, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
        },
    },
    "decision_tree": {
        "class": DecisionTreeClassifier,
        "params": {
            "max_depth": {"type": "int", "default": 15, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
            "criterion": {
                "type": "select",
                "default": "gini",
                "options": ["gini", "entropy"],
            },
        },
    },
    "knn": {
        "class": KNeighborsClassifier,
        "params": {
            "n_neighbors": {"type": "int", "default": 5, "min": 1, "max": 50},
            "weights": {
                "type": "select",
                "default": "distance",
                "options": ["uniform", "distance"],
            },
            "metric": {
                "type": "select",
                "default": "minkowski",
                "options": ["minkowski", "euclidean", "manhattan"],
            },
        },
    },
    "svm": {
        "class": SVC,
        "params": {
            "C": {"type": "float", "default": 10.0, "min": 0.01, "max": 100.0},
            "kernel": {
                "type": "select",
                "default": "rbf",
                "options": ["rbf", "linear", "poly", "sigmoid"],
            },
            "gamma": {
                "type": "select",
                "default": "scale",
                "options": ["scale", "auto"],
            },
        },
    },
    "logistic_regression": {
        "class": LogisticRegression,
        "params": {
            "C": {"type": "float", "default": 1.0, "min": 0.01, "max": 100.0},
            "penalty": {"type": "select", "default": "l2", "options": ["l1", "l2"]},
            "solver": {
                "type": "select",
                "default": "lbfgs",
                "options": ["lbfgs", "liblinear", "saga"],
            },
            "max_iter": {"type": "int", "default": 500, "min": 50, "max": 2000},
        },
    },
    "naive_bayes": {
        "class": GaussianNB,
        "params": {},
    },
    "ada_boost": {
        "class": AdaBoostClassifier,
        "params": {
            "n_estimators": {"type": "int", "default": 100, "min": 10, "max": 200},
            "learning_rate": {"type": "float", "default": 0.5, "min": 0.01, "max": 2.0},
        },
    },
    "mlp": {
        "class": MLPClassifier,
        "params": {
            "hidden_layer_sizes": {"type": "tuple", "default": [128, 64, 32]},
            "activation": {
                "type": "select",
                "default": "relu",
                "options": ["relu", "tanh", "logistic"],
            },
            "alpha": {"type": "float", "default": 0.0001, "min": 0.0001, "max": 0.1},
            "max_iter": {"type": "int", "default": 500, "min": 50, "max": 2000},
        },
    },
}

REGRESSION_MODELS = {
    "random_forest": {
        "class": RandomForestRegressor,
        "params": {
            "n_estimators": {"type": "int", "default": 200, "min": 10, "max": 500},
            "max_depth": {"type": "int", "default": 20, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
            "max_features": {
                "type": "select",
                "default": 1.0,
                "options": ["sqrt", "log2", "None", 1.0],
            },
        },
    },
    "gradient_boosting": {
        "class": GradientBoostingRegressor,
        "params": {
            "n_estimators": {"type": "int", "default": 150, "min": 10, "max": 500},
            "learning_rate": {"type": "float", "default": 0.1, "min": 0.01, "max": 1.0},
            "max_depth": {"type": "int", "default": 5, "min": 1, "max": 20},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "subsample": {"type": "float", "default": 0.9, "min": 0.1, "max": 1.0},
        },
    },
    "extra_trees": {
        "class": ExtraTreesRegressor,
        "params": {
            "n_estimators": {"type": "int", "default": 200, "min": 10, "max": 500},
            "max_depth": {"type": "int", "default": 20, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
        },
    },
    "decision_tree": {
        "class": DecisionTreeRegressor,
        "params": {
            "max_depth": {"type": "int", "default": 15, "min": 1, "max": 50},
            "min_samples_split": {"type": "int", "default": 2, "min": 2, "max": 50},
            "min_samples_leaf": {"type": "int", "default": 1, "min": 1, "max": 20},
            "criterion": {
                "type": "select",
                "default": "squared_error",
                "options": ["squared_error", "absolute_error", "friedman_mse"],
            },
        },
    },
    "knn": {
        "class": KNeighborsRegressor,
        "params": {
            "n_neighbors": {"type": "int", "default": 5, "min": 1, "max": 50},
            "weights": {
                "type": "select",
                "default": "distance",
                "options": ["uniform", "distance"],
            },
            "metric": {
                "type": "select",
                "default": "minkowski",
                "options": ["minkowski", "euclidean", "manhattan"],
            },
        },
    },
    "svr": {
        "class": SVR,
        "params": {
            "C": {"type": "float", "default": 10.0, "min": 0.01, "max": 100.0},
            "kernel": {
                "type": "select",
                "default": "rbf",
                "options": ["rbf", "linear", "poly", "sigmoid"],
            },
            "gamma": {
                "type": "select",
                "default": "scale",
                "options": ["scale", "auto"],
            },
        },
    },
    "linear_regression": {
        "class": LinearRegression,
        "params": {},
    },
    "ridge": {
        "class": Ridge,
        "params": {
            "alpha": {"type": "float", "default": 1.0, "min": 0.001, "max": 100.0},
        },
    },
    "lasso": {
        "class": Lasso,
        "params": {
            "alpha": {"type": "float", "default": 1.0, "min": 0.001, "max": 100.0},
        },
    },
    "elastic_net": {
        "class": ElasticNet,
        "params": {
            "alpha": {"type": "float", "default": 1.0, "min": 0.001, "max": 100.0},
            "l1_ratio": {"type": "float", "default": 0.5, "min": 0.0, "max": 1.0},
        },
    },
    "ada_boost": {
        "class": AdaBoostRegressor,
        "params": {
            "n_estimators": {"type": "int", "default": 50, "min": 10, "max": 200},
            "learning_rate": {"type": "float", "default": 1.0, "min": 0.01, "max": 2.0},
        },
    },
    "mlp": {
        "class": MLPRegressor,
        "params": {
            "hidden_layer_sizes": {"type": "tuple", "default": [100, 50]},
            "activation": {
                "type": "select",
                "default": "relu",
                "options": ["relu", "tanh", "identity"],
            },
            "alpha": {"type": "float", "default": 0.0001, "min": 0.0001, "max": 0.1},
            "max_iter": {"type": "int", "default": 200, "min": 50, "max": 1000},
        },
    },
}


def _build_model(
    model_key: str, model_type: str, hyperparameters: dict, class_weights=None
) -> Any:
    if model_type == "classification":
        models_dict = CLASSIFICATION_MODELS
    else:
        models_dict = REGRESSION_MODELS

    if model_key not in models_dict:
        model_key = "random_forest"

    model_info = models_dict[model_key]
    model_class = model_info["class"]

    params = {}
    for param_name, param_config in model_info["params"].items():
        if param_name in hyperparameters:
            value = hyperparameters[param_name]
            if param_config["type"] == "int":
                params[param_name] = int(value)
            elif param_config["type"] == "float":
                params[param_name] = float(value)
            elif param_config["type"] == "tuple":
                if isinstance(value, str):
                    params[param_name] = tuple(int(x) for x in value.split(","))
                else:
                    params[param_name] = value
            elif param_config["type"] == "select":
                if value == "None":
                    params[param_name] = None
                else:
                    params[param_name] = value
            else:
                params[param_name] = value
        else:
            if param_config["type"] == "select" and param_config["default"] == "None":
                params[param_name] = None
            else:
                params[param_name] = param_config["default"]

    params["random_state"] = 42

    # Add class weights for classification if available
    if model_type == "classification" and class_weights:
        if "class_weight" in model_info["params"] or model_class.__name__ in [
            "RandomForestClassifier",
            "GradientBoostingClassifier",
            "ExtraTreesClassifier",
            "DecisionTreeClassifier",
            "AdaBoostClassifier",
        ]:
            params["class_weight"] = class_weights

    # Some models don't support n_jobs
    no_parallel_models = [
        "GradientBoostingClassifier",
        "GradientBoostingRegressor",
        "AdaBoostClassifier",
        "AdaBoostRegressor",
        "SVC",
        "SVR",
        "MLPClassifier",
        "MLPRegressor",
    ]

    if model_class.__name__ not in no_parallel_models:
        params["n_jobs"] = -1

    return model_class(**params)


class PlaygroundPredictor:
    def __init__(
        self,
        df: pd.DataFrame,
        target_column: str,
        feature_columns: list[str] | None = None,
        model_type: str = "auto",
    ):
        self.df = df.copy()
        self.target_column = target_column
        self.feature_columns = feature_columns
        self.model_type = model_type
        self.is_classification = False
        self.model = None
        self.encoders: dict = {}
        self.scaler = StandardScaler()
        self._trained_features: list[str] = []
        self.model_name: str = ""
        self._column_medians: dict = {}
        self._column_modes: dict = {}

    def _prepare_data(self) -> tuple[pd.DataFrame, pd.Series]:
        if self.target_column not in self.df.columns:
            raise ValueError(f"Column '{self.target_column}' not found")

        df = self.df.dropna(subset=[self.target_column]).copy()

        # Remove low variance columns (constant or near-constant)
        cols_to_remove = []
        for col in df.columns:
            if col == self.target_column:
                continue
            if df[col].dtype in [np.object_, "category"]:
                if df[col].nunique() <= 1:
                    cols_to_remove.append(col)
            else:
                if df[col].std() < 1e-10:
                    cols_to_remove.append(col)

        df = df.drop(columns=cols_to_remove, errors="ignore")

        # Get all columns except target
        all_cols = [c for c in df.columns if c != self.target_column]

        # Handle class imbalance detection for classification
        if self.model_type == "classification":
            self.is_classification = True
        elif self.model_type == "regression":
            self.is_classification = False
        else:
            # Auto-detect: if target has few unique values and is categorical, it's classification
            self.is_classification = df[
                self.target_column
            ].nunique() <= 20 and not pd.api.types.is_numeric_dtype(
                df[self.target_column]
            )

        # Encode categorical columns
        for col in df.select_dtypes(include=["object", "category"]).columns:
            if col != self.target_column:
                le = LabelEncoder()
                # Handle unseen values in test data
                df[col] = df[col].fillna("__MISSING__").astype(str)
                df[col] = le.fit_transform(df[col])
                self.encoders[col] = le

        # If no specific feature columns provided, use ALL columns except target
        if self.feature_columns is None or len(self.feature_columns) == 0:
            feature_cols = all_cols
        else:
            feature_cols = [
                c
                for c in self.feature_columns
                if c in df.columns and c != self.target_column
            ]

        # Store column statistics for prediction time
        for col in feature_cols:
            if col in df.columns:
                if df[col].dtype in [np.number, np.int64, np.float64]:
                    self._column_medians[col] = df[col].median()
                else:
                    mode_vals = df[col].mode()
                    self._column_modes[col] = (
                        mode_vals.iloc[0] if len(mode_vals) > 0 else "__MISSING__"
                    )

        # Fill missing values with median/mode
        for col in feature_cols:
            if col not in df.columns:
                continue
            if df[col].dtype in [np.number, np.int64, np.float64]:
                df[col] = df[col].fillna(
                    self._column_medians.get(col, df[col].median())
                )
            else:
                df[col] = df[col].fillna(self._column_modes.get(col, "__MISSING__"))

        X = df[feature_cols]
        y = df[self.target_column]

        # Handle class imbalance for classification
        self._class_weights = None
        if self.is_classification:
            if not pd.api.types.is_numeric_dtype(y):
                le = LabelEncoder()
                y = le.fit_transform(y)
                self.encoders[self.target_column] = le

            # Check for class imbalance
            class_counts = pd.Series(y).value_counts()
            if len(class_counts) > 1:
                imbalance_ratio = class_counts.max() / class_counts.min()
                if imbalance_ratio > 3:  # If there's significant imbalance
                    self._class_weights = "balanced"

        X = df[feature_cols]
        y = df[self.target_column]

        if self.is_classification and not pd.api.types.is_numeric_dtype(y):
            le = LabelEncoder()
            y = le.fit_transform(y)
            self.encoders[self.target_column] = le

        if len(X.columns) < 1:
            raise ValueError("No valid feature columns selected")

        self._trained_features = list(X.columns)
        return X, y

    def train(
        self,
        model_key: str = "random_forest",
        hyperparameters: dict | None = None,
        validation_config: dict | None = None,
    ) -> dict[str, Any]:
        hyperparameters = hyperparameters or {}
        validation_config = validation_config or {}

        X, y = self._prepare_data()

        test_size = validation_config.get("test_size", 0.2)
        cv_folds = validation_config.get("cv_folds", 0)

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=42,
            stratify=y if self.is_classification else None,
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.model = _build_model(
            model_key,
            "classification" if self.is_classification else "regression",
            hyperparameters,
            class_weights=self._class_weights,
        )
        self.model_name = model_key

        self.model.fit(X_train_scaled, y_train)

        y_pred = self.model.predict(X_test_scaled)

        metrics = {}
        if self.is_classification:
            metrics["accuracy"] = float(accuracy_score(y_test, y_pred))
            metrics["confusion_matrix"] = confusion_matrix(y_test, y_pred).tolist()
            metrics["classes"] = list(np.unique(y))
            if hasattr(self.model, "predict_proba"):
                try:
                    y_proba = self.model.predict_proba(X_test_scaled)
                    metrics["has_proba"] = True
                except:
                    metrics["has_proba"] = False
        else:
            metrics["r2_score"] = float(r2_score(y_test, y_pred))
            metrics["rmse"] = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            metrics["mae"] = float(np.sqrt(mean_squared_error(y_test, y_pred)))

        if cv_folds > 0:
            X_full_scaled = self.scaler.transform(X)
            if self.is_classification:
                cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
                cv_scores = cross_val_score(
                    self.model, X_full_scaled, y, cv=cv, scoring="accuracy"
                )
                metrics["f1_mean"] = float(
                    cross_val_score(
                        self.model, X_full_scaled, y, cv=cv, scoring="f1_weighted"
                    ).mean()
                )
            else:
                cv = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
                cv_scores = cross_val_score(
                    self.model, X_full_scaled, y, cv=cv, scoring="r2"
                )
            metrics["cv_mean"] = float(cv_scores.mean())
            metrics["cv_std"] = float(cv_scores.std())

        feature_importance = []
        if hasattr(self.model, "feature_importances_"):
            feature_importance = sorted(
                [
                    {"feature": col, "importance": float(imp)}
                    for col, imp in zip(X.columns, self.model.feature_importances_)
                ],
                key=lambda x: x["importance"],
                reverse=True,
            )[:15]
        elif hasattr(self.model, "coef_"):
            coefs = np.abs(self.model.coef_).flatten()
            feature_importance = sorted(
                [
                    {"feature": col, "importance": float(abs(coef))}
                    for col, coef in zip(X.columns, coefs)
                ],
                key=lambda x: x["importance"],
                reverse=True,
            )[:15]

        model_display_name = model_key.replace("_", " ").title()

        return {
            "accuracy": metrics.get("accuracy", metrics.get("r2_score", 0)),
            "model_type": f"{model_display_name} {'Classifier' if self.is_classification else 'Regressor'}",
            "model_key": model_key,
            "feature_importance": feature_importance,
            "metrics": metrics,
            "test_size": test_size,
            "features_used": self._trained_features,
        }

    def get_model_schema(self) -> dict:
        if self.is_classification:
            return {
                "type": "classification",
                "models": {
                    k: {"params": v["params"]} for k, v in CLASSIFICATION_MODELS.items()
                },
            }
        else:
            return {
                "type": "regression",
                "models": {
                    k: {"params": v["params"]} for k, v in REGRESSION_MODELS.items()
                },
            }

    def predict_on_data(self, new_df: pd.DataFrame) -> dict[str, Any]:
        if self.model is None:
            raise ValueError("Model not trained")

        df = new_df.copy()

        for col, le in self.encoders.items():
            if col in df.columns and col != self.target_column:
                df[col] = (
                    df[col]
                    .astype(str)
                    .map(
                        lambda x, _le=le: (
                            _le.transform([x])[0] if x in _le.classes_ else -1
                        )
                    )
                )

        available_features = [c for c in self._trained_features if c in df.columns]
        if not available_features:
            raise ValueError("No matching feature columns found")

        X = df[available_features].fillna(0)
        for col in self._trained_features:
            if col not in X.columns:
                X[col] = 0
        X = X[self._trained_features]

        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)

        if self.is_classification and self.target_column in self.encoders:
            le = self.encoders[self.target_column]
            predictions = le.inverse_transform(predictions.astype(int))

        results = []
        for i in range(len(df)):
            row = {"prediction": _to_native(predictions[i])}
            for col in available_features:
                val = new_df.iloc[i][col] if col in new_df.columns else None
                row[col] = _to_native(val)
            results.append(row)

        def clean_nan(obj):
            if isinstance(obj, dict):
                return {k: clean_nan(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [clean_nan(v) for v in obj]
            if isinstance(obj, float) and obj != obj:
                return None
            return obj

        results = clean_nan(results)

        return {
            "predictions": results,
            "total_rows": int(len(results)),
            "model_type": f"{'Classifier' if self.is_classification else 'Regressor'}",
            "model_name": self.model_name,
        }

    def serialize_model(self) -> str:
        if self.model is None:
            raise ValueError("No model to serialize")
        data = {
            "model": self.model,
            "scaler": self.scaler,
            "encoders": self.encoders,
            "target_column": self.target_column,
            "trained_features": self._trained_features,
            "is_classification": self.is_classification,
            "model_name": self.model_name,
        }
        return base64.b64encode(pickle.dumps(data)).decode()

    @classmethod
    def load_model(cls, serialized: str, df: pd.DataFrame) -> "PlaygroundPredictor":
        data = pickle.loads(base64.b64decode(serialized))
        predictor = cls(df, data["target_column"])
        predictor.model = data["model"]
        predictor.scaler = data["scaler"]
        predictor.encoders = data["encoders"]
        predictor._trained_features = data["trained_features"]
        predictor.is_classification = data["is_classification"]
        predictor.model_name = data["model_name"]
        return predictor
