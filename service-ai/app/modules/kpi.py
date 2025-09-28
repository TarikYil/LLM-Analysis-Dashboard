def compute_kpi(df):
    kpis = {}
    if 'NUMBER_OF_SUBSCRIBER' in df.columns:
        kpis['total_subscribers'] = int(df['NUMBER_OF_SUBSCRIBER'].sum())
    if 'SUBSCRIPTION_COUNTY' in df.columns:
        county_dict = df.groupby('SUBSCRIPTION_COUNTY')['NUMBER_OF_SUBSCRIBER'].sum().to_dict()
        kpis['county_distribution'] = {k: int(v) for k,v in county_dict.items()}
    if 'SUBSCRIBER_DOMESTIC_FOREIGN' in df.columns:
        domfor = df.groupby('SUBSCRIBER_DOMESTIC_FOREIGN')['NUMBER_OF_SUBSCRIBER'].sum().to_dict()
        kpis['domestic_foreign_distribution'] = {k: int(v) for k,v in domfor.items()}
    return kpis
