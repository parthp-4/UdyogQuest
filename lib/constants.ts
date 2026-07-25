export const VERIFIED_UNAVAILABLE = "Information unavailable from verified government source.";

export const SUPPORTED_INDUSTRIES = [
  {
    id: "FOOD",
    label: "Food Businesses",
    examples: [
      "Cloud Kitchen",
      "Restaurant",
      "Cafe",
      "Bakery",
      "Dairy",
      "Food Processing",
      "Pickle Unit",
      "Meat Shop",
      "Grocery with food license"
    ]
  },
  {
    id: "EXPORT_IMPORT",
    label: "Export / Import Businesses",
    examples: [
      "Merchant Exporter",
      "Manufacturer Exporter",
      "Importer",
      "Trading Company",
      "Export House",
      "DGFT related businesses"
    ]
  }
] as const;

