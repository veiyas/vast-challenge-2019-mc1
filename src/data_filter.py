import pandas as pd

data = pd.read_csv("data/mc1-reports-data.csv")

for i in range(1, 20):
    filtered = data[data['location'] == i]
    filtered['time'] = pd.to_datetime(filtered.time, infer_datetime_format=True)
    filtered.sort_values(by='time', ascending=True, inplace=True)
    filtered.to_csv('data/location' + str(i) + '.csv')
