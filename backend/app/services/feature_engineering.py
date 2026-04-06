import pandas as pd
import numpy as np
from typing import Any


class FeatureEngineeringService:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self._derived_columns: dict[str, pd.Series] = {}

    def add_column(self, name: str, formula: dict) -> pd.DataFrame:
        result = self._compute_formula(formula)
        self._derived_columns[name] = result
        df = self.df.copy()
        df[name] = result
        return df

    def _compute_formula(self, formula: dict) -> pd.Series:
        op = formula.get("operation")

        if op in ("add", "subtract", "multiply", "divide"):
            left = formula.get("left")
            right = formula.get("right")
            if isinstance(left, dict):
                left_series = self._compute_formula(left)
            else:
                left_series = (
                    self.df[left]
                    if left in self.df.columns
                    else pd.Series([left] * len(self.df))
                )

            if isinstance(right, dict):
                right_series = self._compute_formula(right)
            else:
                right_series = (
                    self.df[right]
                    if right in self.df.columns
                    else pd.Series([right] * len(self.df))
                )

            if op == "add":
                return left_series + right_series
            elif op == "subtract":
                return left_series - right_series
            elif op == "multiply":
                return left_series * right_series
            elif op == "divide":
                return left_series / right_series.replace(0, np.nan)

        elif op == "log":
            col = formula.get("column")
            return np.log(self.df[col].clip(lower=0) + 1e-10)

        elif op == "sqrt":
            col = formula.get("column")
            return np.sqrt(self.df[col].clip(lower=0))

        elif op == "square":
            col = formula.get("column")
            return self.df[col] ** 2

        elif op == "abs":
            col = formula.get("column")
            return np.abs(self.df[col])

        elif op == "standardize":
            col = formula.get("column")
            mean = self.df[col].mean()
            std = self.df[col].std()
            return (self.df[col] - mean) / (std + 1e-10)

        elif op == "normalize":
            col = formula.get("column")
            min_val = self.df[col].min()
            max_val = self.df[col].max()
            return (self.df[col] - min_val) / (max_val - min_val + 1e-10)

        elif op == "bin":
            col = formula.get("column")
            bins = formula.get("bins", 5)
            labels = formula.get("labels")
            if labels:
                return pd.cut(self.df[col], bins=bins, labels=labels).astype(str)
            return pd.cut(self.df[col], bins=bins).astype(str)

        elif op == "if_else":
            condition = formula.get("condition")
            then_val = formula.get("then")
            else_val = formula.get("else")

            if isinstance(then_val, dict):
                then_series = self._compute_formula(then_val)
            else:
                then_series = pd.Series([then_val] * len(self.df))

            if isinstance(else_val, dict):
                else_series = self._compute_formula(else_val)
            else:
                else_series = pd.Series([else_val] * len(self.df))

            col = condition.get("column")
            operator = condition.get("operator")
            value = condition.get("value")

            if operator == "==":
                mask = self.df[col] == value
            elif operator == "!=":
                mask = self.df[col] != value
            elif operator == ">":
                mask = self.df[col] > value
            elif operator == "<":
                mask = self.df[col] < value
            elif operator == ">=":
                mask = self.df[col] >= value
            elif operator == "<=":
                mask = self.df[col] <= value
            else:
                mask = pd.Series([False] * len(self.df))

            result = then_series.copy()
            result[~mask] = else_series[~mask]
            return result

        elif op == "aggregate":
            col = formula.get("column")
            agg_func = formula.get("function", "sum")
            group_by = formula.get("group_by")

            if group_by:
                grouped = self.df.groupby(group_by)[col]
            else:
                grouped = self.df[col]

            if agg_func == "sum":
                result = grouped.transform("sum")
            elif agg_func == "mean":
                result = grouped.transform("mean")
            elif agg_func == "median":
                result = grouped.transform("median")
            elif agg_func == "min":
                result = grouped.transform("min")
            elif agg_func == "max":
                result = grouped.transform("max")
            elif agg_func == "count":
                result = grouped.transform("count")
            elif agg_func == "std":
                result = grouped.transform("std")
            elif agg_func == "var":
                result = grouped.transform("var")
            else:
                result = grouped.transform("sum")

            return result

        elif op == "constant":
            value = formula.get("value")
            return pd.Series([value] * len(self.df))

        return pd.Series([np.nan] * len(self.df))

    def get_available_columns(self) -> list[dict]:
        columns = []
        for col in self.df.columns:
            dtype = (
                "numeric"
                if pd.api.types.is_numeric_dtype(self.df[col])
                else "categorical"
            )
            columns.append(
                {
                    "name": col,
                    "type": dtype,
                    "count": int(self.df[col].count()),
                }
            )
        return columns

    def preview_formula(self, formula: dict, name: str) -> dict[str, Any]:
        result = self._compute_formula(formula)
        return {
            "name": name,
            "preview": result.head(10).tolist(),
            "sample_values": result.dropna().head(5).tolist(),
        }

    def validate_formula(self, formula: dict) -> dict[str, Any]:
        try:
            result = self._compute_formula(formula)
            return {
                "valid": True,
                "result_type": "numeric"
                if pd.api.types.is_numeric_dtype(result)
                else "categorical",
                "sample": result.head(3).tolist(),
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e),
            }
