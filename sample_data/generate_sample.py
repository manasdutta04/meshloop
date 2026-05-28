import pandas as pd
import numpy as np
import os

os.makedirs("sample_data", exist_ok=True)
np.random.seed(42)
n = 300

df = pd.DataFrame({
    "Date":       pd.date_range("2023-01-01", periods=n, freq="D"),
    "Product":    np.random.choice(["Widget A", "WIDGET A", "widget b", "Widget B", "Widget C"], n),
    "Sales":      np.random.normal(500, 120, n).round(2),
    "Returns":    np.random.normal(45, 25, n).round(2),
    "Region":     np.random.choice(["North", "South", "East", "West", None, None], n),
    "CustomerID": np.random.randint(1000, 9999, n),
    "Discount":   np.random.choice([0, 5, 10, 15, 20, None], n),
})

# Inject intentional mess
df.loc[42, "Sales"] = 9999.99   # extreme outlier
df.loc[150, "Returns"] = -500   # negative outlier
df.loc[[10, 20, 30], "Sales"] = None  # nulls
df.loc[df["Product"].str.upper() == "WIDGET B", "Returns"] *= 3.2  # hidden pattern!

df.to_csv("sample_data/messy_sales.csv", index=False)
print("Created sample_data/messy_sales.csv")
print(f"   Shape: {df.shape}, Nulls: {df.isnull().sum().sum()}")
