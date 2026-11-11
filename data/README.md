# data/

**Owner: AI/Data.**

| Folder | Content | In git? |
|---|---|---|
| `raw/` | Downloads from NASA OSDR (can be huge) | NO (ignored) |
| `processed/` | Small, derived tables the engine needs (keep each file small) | yes |
| `runtime/` | SQLite DB created by the API | NO (ignored) |

Cite NASA OSDR in the app and README: "Data are courtesy of the NASA Open Science Data Repository (https://osdr.nasa.gov/bio/repo)".
Controlled-access astronaut data needs a data-use agreement: never commit it.
