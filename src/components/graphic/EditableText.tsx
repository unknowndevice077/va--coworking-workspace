// A plain, presentational component — no "use client" needed. Rendered
// read-only (editable=false) it's used straight from Server Components for
// thumbnails and the client portal. Rendered editable=true (inside the
// studio, which is a client component) it becomes a click-to-edit region,
// same interaction model as a real design tool: click text, type, click away.
type Tag = "span" | "div" | "h1" | "h2" | "p";

export function EditableText({
  as: Tag = "span",
  value,
  editable,
  onEdit,
  className,
  style,
}: {
  as?: Tag;
  value: string;
  editable: boolean;
  onEdit?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!editable) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={{ ...style, outline: "none", cursor: "text" }}
      contentEditable
      suppressContentEditableWarning
      data-editable="true"
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onBlur={(e) => onEdit?.(e.currentTarget.textContent ?? "")}
    >
      {value}
    </Tag>
  );
}
