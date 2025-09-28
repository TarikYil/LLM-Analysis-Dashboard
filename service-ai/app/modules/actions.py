def action_items(kpi):
    items = []
    if 'county_distribution' in kpi:
        top3 = sorted(kpi['county_distribution'], key=kpi['county_distribution'].get, reverse=True)[:3]
        for c in top3:
            items.append(f"{c} The subscriber density in the district is very high; infrastructure improvements are recommended.")
    return items
