def action_items(kpi):
    items = []
    if 'county_distribution' in kpi:
        top3 = sorted(kpi['county_distribution'], key=kpi['county_distribution'].get, reverse=True)[:3]
        for c in top3:
            items.append(f"{c} ilçesinde abone yoğunluğu çok yüksek, altyapı iyileştirme önerilir.")
    return items
