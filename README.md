# Healthcare Operations Intelligence Dashboard with Decision Analytics

**Infosys Springboard Virtual Internship 7.0 · Batch 3**

An end-to-end analytics project that turns a patient-level admissions dataset into an interactive
operations dashboard, a 6-month admission forecast, and a rule-based decision engine that produces
prioritized recommendations for hospital administrators.

| | |
|---|---|
| **Live dashboard** | `<ADD GITHUB PAGES URL HERE>` (see [docs/deployment_guide.md](docs/deployment_guide.md)) |
| **Demo video** | `<ADD VIDEO LINK HERE>` (script: [docs/demo_video_script.md](docs/demo_video_script.md)) |
| **Agile documents** | [agile/](agile/) |
| **Project report** | [docs/Project_Report.docx](docs/Project_Report.docx) |

## Features
- **KPI overview** - total admissions, average length of stay, average billing, abnormal test rate, emergency share
- **Condition scorecard** - six conditions compared against the network average with an On Target / Watch / Needs Attention status (z-score based)
- **Payer analysis** - average billing by insurance provider
- **Forecasting** - linear-regression projection of monthly admissions, network-wide and per condition (partial boundary months excluded)
- **Decision analytics** - prioritized, human-readable recommendations generated from the data
- **BI-ready exports** - CSVs for Power BI / Tableau

## Repository structure
```
.
├── data/healthcare_dataset.csv         # source dataset (10,000 admissions)
├── src/
│   ├── healthcare_ops_analytics.py     # analytics pipeline (pandas + scikit-learn)
│   └── build_dashboard.py              # embeds pipeline output into the dashboard
├── dashboard/
│   ├── template.html                   # dashboard source (Chart.js)
│   └── index.html                      # built, self-contained dashboard (deployed)
├── outputs/                            # generated CSV/JSON exports
├── docs/                               # report, architecture, data dictionary, test plan, deployment, demo script
├── agile/                              # sprint plan, user stories, task board, progress report, retrospective
├── requirements.txt
└── README.md
```

## Dependencies
- Python 3.9+
- pandas, numpy, scikit-learn (see `requirements.txt`)
- Chart.js 4.4.1 (loaded from cdnjs by the dashboard; internet required to view charts)

## Installation & running
```bash
git clone <YOUR_REPO_URL>
cd <repo-folder>
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 1. run the analytics pipeline (regenerates everything in outputs/)
python src/healthcare_ops_analytics.py data/healthcare_dataset.csv outputs

# 2. rebuild the dashboard from the fresh outputs
python src/build_dashboard.py

# 3. open the dashboard
open dashboard/index.html        # macOS  (Windows: start dashboard\index.html)
```
To use different data, replace `data/healthcare_dataset.csv` with a file that has the same columns
(see [docs/data_dictionary.md](docs/data_dictionary.md)) and rerun steps 1-2.

## Key results (from the supplied dataset)
- 10,000 admissions, 2018-10-30 to 2023-10-30; average stay 15.56 days; average billing $25,517
- Abnormal test rate 34.6%; emergency share 33.7%
- Asthma and Diabetes flagged **Watch**; Aetna billing ~1.3% above network average
- Forecast is flat (slope +0.03 admissions/month, R² ≈ 0.001)

## Data note and limitations
The dataset is the widely used synthetic "Healthcare Dataset": values are randomly generated, so metrics
cluster near the average and no strong trends exist. The pipeline is fully functional and will surface
sharper signals on a real EHR/ADT extract. The data has no patient identifier, occupancy or staffing
fields, so readmission and bed-occupancy KPIs are not computed. The exported analytical CSV drops the
`Name` and `Doctor` columns.

## Technology
Python · pandas · NumPy · scikit-learn · HTML/CSS/JavaScript · Chart.js · GitHub Pages
