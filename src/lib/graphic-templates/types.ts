export type TemplateCategory = "Social Post" | "Flyer" | "Logo" | "Business Card" | "Presentation";

export interface FieldDef {
  key: string;
  label: string;
  default: string;
}

export interface GraphicProps {
  /** Current text for every field, keyed by FieldDef.key. */
  values: Record<string, string>;
  hue: number;
  /** When true, text renders as click-to-edit contenteditable regions. */
  editable: boolean;
  onEdit?: (key: string, value: string) => void;
}

export interface GraphicTemplateDef {
  id: string;
  name: string;
  category: TemplateCategory;
  keywords: string[];
  defaultHue: number;
  /** Fixed export resolution — every preview/thumbnail is this same canvas, scaled. */
  width: number;
  height: number;
  fields: FieldDef[];
  /** The field a prompt's guessed headline should fill in when starting a new design. */
  primaryField: string;
  Component: React.ComponentType<GraphicProps>;
}

export function defaultFieldValues(template: GraphicTemplateDef): Record<string, string> {
  return Object.fromEntries(template.fields.map((f) => [f.key, f.default]));
}
