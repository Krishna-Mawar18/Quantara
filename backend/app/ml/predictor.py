import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    RandomForestRegressor,
    GradientBoostingClassifier,
    GradientBoostingRegressor,
)
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error
from typing import Any


def _to_native(val):
    if val is None:
        return None
    if isinstance(val, float) and (val != val):  # NaN check
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        f = float(val)
        return f if f == f else None  # NaN check
    if isinstance(val, np.ndarray):
        return [_to_native(v) for v in val]
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, (pd.Timestamp,)):
        return str(val)
    return val


class Predictor:
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

    def train(self) -> dict[str, Any]:
        if self.target_column not in self.df.columns:
            raise ValueError(f"Column '{self.target_column}' not found")

        self.df = self.df.dropna(subset=[self.target_column])

        for col in self.df.select_dtypes(include=["object", "category"]).columns:
            le = LabelEncoder()
            self.df[col] = le.fit_transform(self.df[col].astype(str))
            self.encoders[col] = le

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        if self.target_column in numeric_cols:
            numeric_cols.remove(self.target_column)

        if self.feature_columns:
            available = [c for c in self.feature_columns if c in numeric_cols]
            if available:
                numeric_cols = available

        self.df[numeric_cols] = self.df[numeric_cols].fillna(
            self.df[numeric_cols].median()
        )

        if self.model_type == "classification":
            self.is_classification = True
        elif self.model_type == "regression":
            self.is_classification = False
        else:
            self.is_classification = self.df[
                self.target_column
            ].nunique() <= 20 and not pd.api.types.is_numeric_dtype(
                self.df[self.target_column]
            )

        X = self.df[numeric_cols]
        y = self.df[self.target_column]

        if self.is_classification and not pd.api.types.is_numeric_dtype(y):
            le = LabelEncoder()
            y = le.fit_transform(y)
            self.encoders[self.target_column] = le

        if len(X.columns) < 1:
            raise ValueError("No valid feature columns selected")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        if self.is_classification:
            models = {
                "Random Forest": RandomForestClassifier(
                    n_estimators=100, random_state=42, n_jobs=-1
                ),
                "Gradient Boosting": GradientBoostingClassifier(
                    n_estimators=100, random_state=42
                ),
            }
        else:
            models = {
                "Random Forest": RandomForestRegressor(
                    n_estimators=100, random_state=42, n_jobs=-1
                ),
                "Gradient Boosting": GradientBoostingRegressor(
                    n_estimators=100, random_state=42
                ),
            }

        best_model = None
        best_score = -np.inf
        best_name = ""

        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            if self.is_classification:
                score = accuracy_score(y_test, model.predict(X_test_scaled))
            else:
                score = r2_score(y_test, model.predict(X_test_scaled))

            if score > best_score:
                best_score = score
                best_model = model
                best_name = name

        self.model = best_model
        self._trained_features = list(X.columns)
        feature_importance = sorted(
            [
                {"feature": col, "importance": float(imp)}
                for col, imp in zip(X.columns, self.model.feature_importances_)
            ],
            key=lambda x: x["importance"],
            reverse=True,
        )[:10]

        metrics = {}
        y_pred = self.model.predict(X_test_scaled)
        if self.is_classification:
            metrics["accuracy"] = float(accuracy_score(y_test, y_pred))
        else:
            metrics["r2_score"] = float(r2_score(y_test, y_pred))
            metrics["rmse"] = float(np.sqrt(mean_squared_error(y_test, y_pred)))

        return {
            "accuracy": float(best_score),
            "model_type": f"{best_name} {'Classifier' if self.is_classification else 'Regressor'}",
            "feature_importance": feature_importance,
            "metrics": metrics,
        }

    def predict_on_data(self, new_df: pd.DataFrame) -> dict[str, Any]:
        if self.model is None:
            self.train()

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
            raise ValueError("No matching feature columns found in the uploaded file")

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

        # Clean any remaining NaN values
        import json

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
        }
