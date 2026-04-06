import pandas as pd
import numpy as np
import re
from typing import Any


class AnalyticsService:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def _is_id_column(self, col: str) -> bool:
        col_lower = col.lower().strip()
        if col_lower in (
            "id",
            "key",
            "uuid",
            "index",
            "row",
            "row_number",
            "sr",
            "sr_no",
            "sno",
            "sl",
        ):
            return True
        if re.match(r"^(id|key|uuid|index|row|sr)_", col_lower):
            return True
        if (
            col_lower.endswith("_id")
            or col_lower.endswith("_key")
            or col_lower.endswith("_uuid")
        ):
            return True
        uniqueness = self.df[col].nunique() / max(len(self.df), 1)
        if uniqueness > 0.95 and self.df[col].nunique() > 50:
            return True
        if self.df[col].dtype == object:
            sample = self.df[col].dropna().head(20).astype(str)
            if (
                len(sample) > 0
                and sample.str.match(
                    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
                    case=False,
                ).mean()
                > 0.5
            ):
                return True
            if (
                len(sample) > 0
                and sample.str.match(r"^[0-9a-f]{24,}$", case=False).mean() > 0.5
            ):
                return True
        return False

    def analyze(self) -> dict[str, Any]:
        return {
            "summary": self._get_summary(),
            "correlations": self._get_correlations(),
            "insights": self._generate_insights(),
            "charts": self._generate_charts(),
        }

    def _get_summary(self) -> list[dict]:
        summary = []
        for col in self.df.columns:
            col_info = {
                "name": col,
                "type": self._classify_type(col),
                "count": int(self.df[col].count()),
                "missing": int(self.df[col].isna().sum()),
                "unique": int(self.df[col].nunique()),
                "is_id": self._is_id_column(col),
            }

            if col_info["type"] == "numeric":
                col_info.update(
                    {
                        "mean": float(self.df[col].mean()),
                        "median": float(self.df[col].median()),
                        "std": float(self.df[col].std()),
                        "min": float(self.df[col].min()),
                        "max": float(self.df[col].max()),
                    }
                )
            elif col_info["type"] == "categorical":
                top = self.df[col].value_counts().head(5)
                col_info["top_values"] = [
                    {"value": str(v), "count": int(c)} for v, c in top.items()
                ]

            summary.append(col_info)
        return summary

    def _classify_type(self, col: str) -> str:
        if pd.api.types.is_numeric_dtype(self.df[col]):
            return "numeric"
        if pd.api.types.is_datetime64_any_dtype(self.df[col]):
            return "datetime"
        if self.df[col].nunique() < 20:
            return "categorical"
        return "text"

    def _get_correlations(self) -> dict:
        numeric_cols = [
            c
            for c in self.df.select_dtypes(include=[np.number]).columns
            if not self._is_id_column(c)
        ]
        if len(numeric_cols) < 2:
            return {}
        corr = self.df[numeric_cols].corr().round(3)
        corr_dict = corr.where(pd.notnull(corr)).to_dict()
        return {
            k: {kk: (vv if pd.notnull(vv) else None) for kk, vv in v.items()}
            for k, v in corr_dict.items()
        }

    def _generate_insights(self) -> list[str]:
        insights = []
        numeric_cols = [
            c
            for c in self.df.select_dtypes(include=[np.number]).columns
            if not self._is_id_column(c)
        ]
        cat_cols = [
            c
            for c in self.df.select_dtypes(include=["object", "category"]).columns
            if not self._is_id_column(c)
        ]

        for col in numeric_cols:
            missing_pct = (self.df[col].isna().sum() / len(self.df)) * 100
            if missing_pct > 10:
                insights.append(
                    f"'{col}' has {missing_pct:.1f}% missing values — consider imputation."
                )

            skew = self.df[col].skew()
            if abs(skew) > 1:
                direction = "right" if skew > 0 else "left"
                insights.append(
                    f"'{col}' is heavily skewed to the {direction} (skewness: {skew:.2f})."
                )

        if len(numeric_cols) >= 2:
            corr = self.df[numeric_cols].corr()
            for i in range(len(corr.columns)):
                for j in range(i + 1, len(corr.columns)):
                    val = corr.iloc[i, j]
                    if abs(val) > 0.8:
                        insights.append(
                            f"Strong {'positive' if val > 0 else 'negative'} correlation "
                            f"({val:.2f}) between '{corr.columns[i]}' and '{corr.columns[j]}'."
                        )

        for col in cat_cols:
            top = self.df[col].value_counts().head(1)
            if len(top) > 0:
                pct = (top.values[0] / len(self.df)) * 100
                if pct > 50:
                    insights.append(
                        f"'{col}' is dominated by '{top.index[0]}' ({pct:.1f}% of records)."
                    )

        if not insights:
            insights.append("Data looks clean. No significant anomalies detected.")

        return insights

    def _generate_charts(self) -> list[dict]:
        charts = []
        numeric_cols = [
            c
            for c in self.df.select_dtypes(include=[np.number]).columns
            if not self._is_id_column(c)
        ]
        cat_cols = [
            c
            for c in self.df.select_dtypes(include=["object", "category"]).columns
            if not self._is_id_column(c)
        ]

        for col in cat_cols[:3]:
            if self.df[col].nunique() <= 15:
                counts = self.df[col].value_counts().head(10)
                charts.append(
                    {
                        "type": "bar",
                        "title": f"Distribution of {col}",
                        "data": [
                            {"name": str(k), "value": int(v)} for k, v in counts.items()
                        ],
                        "xKey": "name",
                        "yKey": "value",
                    }
                )

        for col in numeric_cols[:2]:
            charts.append(
                {
                    "type": "histogram",
                    "title": f"Distribution of {col}",
                    "data": self._histogram_data(col),
                    "xKey": "bin",
                    "yKey": "count",
                }
            )

        return charts

    def _histogram_data(self, col: str, bins: int = 15) -> list[dict]:
        counts, edges = np.histogram(self.df[col].dropna(), bins=bins)
        return [
            {
                "bin": f"{edges[i]:.0f}-{edges[i + 1]:.0f}",
                "count": int(counts[i]),
            }
            for i in range(len(counts))
        ]

    def generate_custom_chart(
        self, chart_type: str, x_column: str, y_column: str | None, hue: list[str]
    ) -> dict[str, Any]:
        df = self.df.copy()

        if hue:
            df["_hue"] = df[hue].astype(str).agg(" | ".join, axis=1)
            hue_col = "_hue"
        else:
            hue_col = None

        if chart_type == "histogram":
            if not pd.api.types.is_numeric_dtype(df[x_column]):
                counts = df[x_column].value_counts().head(30)
                data = [{"name": str(k), "value": int(v)} for k, v in counts.items()]
                return {
                    "type": "bar",
                    "title": f"Distribution of {x_column}",
                    "data": data,
                    "xKey": "name",
                    "yKey": "value",
                }
            return {
                "type": "histogram",
                "title": f"Distribution of {x_column}",
                "data": self._histogram_data(x_column),
                "xKey": "bin",
                "yKey": "count",
            }

        if chart_type == "pie":
            counts = df[x_column].value_counts().head(15)
            data = [{"name": str(k), "value": int(v)} for k, v in counts.items()]
            return {
                "type": "pie",
                "title": f"Distribution of {x_column}",
                "data": data,
                "xKey": "name",
                "yKey": "value",
            }

        if chart_type == "scatter":
            if not y_column:
                raise ValueError("y_column is required for scatter charts")
            cols = [x_column, y_column]
            if hue_col:
                cols.append(hue_col)
            subset = df[cols].dropna()
            data = subset.to_dict(orient="records")
            for row in data:
                for k, v in row.items():
                    if isinstance(v, (np.integer,)):
                        row[k] = int(v)
                    elif isinstance(v, (np.floating,)):
                        if np.isnan(v) or np.isinf(v):
                            row[k] = None
                        else:
                            row[k] = float(v)
            return {
                "type": "scatter",
                "title": f"{y_column} vs {x_column}",
                "data": data,
                "xKey": x_column,
                "yKey": y_column,
                "seriesKey": hue_col,
            }

        if chart_type == "line":
            if not y_column:
                raise ValueError("y_column is required for line charts")
            if hue_col:
                groups = df.groupby(hue_col)
                all_data = []
                for name, group in groups:
                    for _, row in group.iterrows():
                        all_data.append(
                            {
                                x_column: str(row[x_column]),
                                y_column: float(row[y_column])
                                if pd.notna(row[y_column])
                                else 0,
                                "_series": str(name),
                            }
                        )
                return {
                    "type": "line",
                    "title": f"{y_column} by {x_column}",
                    "data": all_data,
                    "xKey": x_column,
                    "yKey": y_column,
                    "seriesKey": "_series",
                }
            subset = df[[x_column, y_column]].dropna().head(100)
            data = []
            for _, row in subset.iterrows():
                data.append(
                    {
                        x_column: str(row[x_column]),
                        y_column: float(row[y_column])
                        if pd.notna(row[y_column])
                        else 0,
                    }
                )
            return {
                "type": "line",
                "title": f"{y_column} by {x_column}",
                "data": data,
                "xKey": x_column,
                "yKey": y_column,
            }

        if chart_type == "area":
            if not y_column:
                raise ValueError("y_column is required for area charts")
            if hue_col:
                groups = df.groupby(hue_col)
                all_data = []
                for name, group in groups:
                    for _, row in group.iterrows():
                        all_data.append(
                            {
                                x_column: str(row[x_column]),
                                y_column: float(row[y_column])
                                if pd.notna(row[y_column])
                                else 0,
                                "_series": str(name),
                            }
                        )
                return {
                    "type": "area",
                    "title": f"{y_column} by {x_column}",
                    "data": all_data,
                    "xKey": x_column,
                    "yKey": y_column,
                    "seriesKey": "_series",
                }
            subset = df[[x_column, y_column]].dropna().head(100)
            data = []
            for _, row in subset.iterrows():
                data.append(
                    {
                        x_column: str(row[x_column]),
                        y_column: float(row[y_column])
                        if pd.notna(row[y_column])
                        else 0,
                    }
                )
            return {
                "type": "area",
                "title": f"{y_column} by {x_column}",
                "data": data,
                "xKey": x_column,
                "yKey": y_column,
            }

        if chart_type == "stacked":
            if not y_column:
                raise ValueError("y_column is required for stacked bar charts")
            if hue_col:
                pivot = df.groupby([hue_col, x_column])[y_column].mean().reset_index()
                pivot.columns = ["_series", "name", "value"]
                data = []
                for _, row in pivot.iterrows():
                    data.append(
                        {
                            "name": str(row["name"]),
                            "value": round(float(row["value"]), 2)
                            if pd.notna(row["value"])
                            else 0,
                            "_series": str(row["_series"]),
                        }
                    )
                return {
                    "type": "stacked",
                    "title": f"Mean {y_column} by {x_column}",
                    "data": data,
                    "xKey": "name",
                    "yKey": "value",
                    "seriesKey": "_series",
                }
            grouped = df.groupby(x_column)[y_column].mean().head(20).reset_index()
            grouped.columns = ["name", "value"]
            data = [
                {
                    "name": str(row["name"]),
                    "value": round(float(row["value"]), 2)
                    if pd.notna(row["value"])
                    else 0,
                }
                for _, row in grouped.iterrows()
            ]
            return {
                "type": "stacked",
                "title": f"Mean {y_column} by {x_column}",
                "data": data,
                "xKey": "name",
                "yKey": "value",
            }

        if chart_type == "radar":
            if not y_column:
                raise ValueError("y_column is required for radar charts")
            if hue_col:
                pivot = df.groupby([hue_col, x_column])[y_column].mean().reset_index()
                pivot.columns = ["_series", "name", "value"]
                radar_data = {}
                for _, row in pivot.iterrows():
                    subject = str(row["name"])
                    series = str(row["_series"])
                    if subject not in radar_data:
                        radar_data[subject] = {"subject": subject}
                    radar_data[subject][series] = (
                        round(float(row["value"]), 2) if pd.notna(row["value"]) else 0
                    )
                all_series = pivot["_series"].unique().tolist()
                return {
                    "type": "radar",
                    "title": f"{y_column} by {x_column}",
                    "data": list(radar_data.values()),
                    "xKey": "subject",
                    "yKey": y_column,
                    "seriesKey": "_series",
                    "yKeys": all_series,
                }
            grouped = df.groupby(x_column)[y_column].mean().head(10).reset_index()
            grouped.columns = ["subject", y_column]
            data = [
                {
                    "subject": str(row["subject"]),
                    y_column: round(float(row[y_column]), 2)
                    if pd.notna(row[y_column])
                    else 0,
                }
                for _, row in grouped.iterrows()
            ]
            return {
                "type": "radar",
                "title": f"{y_column} by {x_column}",
                "data": data,
                "xKey": "subject",
                "yKey": y_column,
            }

        # bar (default)
        if not y_column:
            counts = df[x_column].value_counts().head(20)
            data = [{"name": str(k), "value": int(v)} for k, v in counts.items()]
            return {
                "type": "bar",
                "title": f"Count of {x_column}",
                "data": data,
                "xKey": "name",
                "yKey": "value",
            }

        if hue_col:
            pivot = df.groupby([hue_col, x_column])[y_column].mean().reset_index()
            pivot.columns = ["_series", "name", "value"]
            data = []
            for _, row in pivot.iterrows():
                data.append(
                    {
                        "name": str(row["name"]),
                        "value": round(float(row["value"]), 2)
                        if pd.notna(row["value"])
                        else 0,
                        "_series": str(row["_series"]),
                    }
                )
            return {
                "type": "bar",
                "title": f"Mean {y_column} by {x_column}",
                "data": data,
                "xKey": "name",
                "yKey": "value",
                "seriesKey": "_series",
            }

        grouped = df.groupby(x_column)[y_column].mean().head(20).reset_index()
        grouped.columns = ["name", "value"]
        data = [
            {
                "name": str(row["name"]),
                "value": round(float(row["value"]), 2) if pd.notna(row["value"]) else 0,
            }
            for _, row in grouped.iterrows()
        ]
        return {
            "type": "bar",
            "title": f"Mean {y_column} by {x_column}",
            "data": data,
            "xKey": "name",
            "yKey": "value",
        }
