import pandas as pd
import numpy as np

np.random.seed(42)

n = 1000
labels = np.random.choice(['Normal', 'Anomaly'], size=n, p=[0.95, 0.05])
sales = np.where(labels == 'Normal', np.random.normal(520, 110, n), np.random.normal(950, 80, n))
returns = np.where(labels == 'Normal', np.random.normal(38, 12, n), np.random.normal(120, 30, n))
discount = np.random.choice([0, 5, 10, 15, 20], size=n, p=[0.6, 0.15, 0.1, 0.1, 0.05])
region = np.random.choice(['North', 'South', 'East', 'West'], size=n, p=[0.25, 0.25, 0.25, 0.25])
product = np.random.choice(['Widget A', 'Widget B', 'Widget C'], size=n, p=[0.5, 0.35, 0.15])
product = np.where(np.random.rand(n) < 0.05, [p.upper() for p in product], product)
returns = np.where(np.random.rand(n) < 0.04, np.nan, returns)
discount = np.where(np.random.rand(n) < 0.03, None, discount)

out = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=n, freq='D'),
    'Product': product,
    'Region': region,
    'Sales': np.round(sales, 2),
    'Returns': np.round(returns, 2),
    'Discount': discount,
    'OrderStatus': labels,
})
out['Priority'] = np.where(np.random.rand(n) < 0.92, 'Standard', 'Premium')

out_path = 'sample_data/imbalanced_sales.csv'
out.to_csv(out_path, index=False)
print('Created', out_path, 'shape', out.shape)
print('\nOrderStatus distribution:')
print(out['OrderStatus'].value_counts(normalize=True).mul(100).round(1))
print('\nPriority distribution:')
print(out['Priority'].value_counts(normalize=True).mul(100).round(1))
