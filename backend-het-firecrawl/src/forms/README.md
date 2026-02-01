# PDF Form Templates

Place your fillable PDF forms in this directory. The filenames must match those defined in `src/config/formCatalog.js`.

## Required Forms

| Form ID | Filename | Description |
|---------|----------|-------------|
| `data-breach-claim` | `data-breach-claim.pdf` | For data breach compensation claims |
| `class-action-claim` | `class-action-claim.pdf` | For class action lawsuit claims |
| `unclaimed-property` | `unclaimed-property.pdf` | For unclaimed property/escheatment claims |
| `insurance-claim` | `insurance-claim.pdf` | For insurance policy claims |
| `consumer-complaint` | `consumer-complaint.pdf` | For consumer protection complaints |
| `employment-claim` | `employment-claim.pdf` | For employment/labor claims |

## Form Requirements

1. **Must be fillable PDFs** - Forms need interactive form fields (text boxes, checkboxes, dropdowns)
2. **Field names should be descriptive** - Use names like "Full Name", "Email", "Date of Incident"
3. **Keep file sizes reasonable** - Under 5MB recommended

## Adding a New Form

1. Add the form entry to `src/config/formCatalog.js`
2. Place the PDF file in this directory with the matching filename
3. The form will automatically appear in the catalog API

## Testing

Use the API to check which forms are available:

```bash
curl http://localhost:3001/api/documents/forms/catalog
```
