export const DOCUMENT_TYPES = [
  { id: "PLAN", label: "Plan ou schéma du local", color: "#2563eb", badgeClass: "badge-blue" },
  { id: "LOCATION_PROOF", label: "Justificatif relatif au local", color: "#0d9488", badgeClass: "badge-teal" },
  { id: "SECURITY", label: "Document de sécurité", color: "#ea580c", badgeClass: "badge-orange" },
  { id: "ADMINISTRATIVE", label: "Document administratif", color: "#7c3aed", badgeClass: "badge-purple" },
  { id: "OTHER", label: "Autre document", color: "#64748b", badgeClass: "badge-gray" },
];

export function getDocumentTypeInfo(typeLabelOrId) {
  if (!typeLabelOrId) return DOCUMENT_TYPES[4];
  const found = DOCUMENT_TYPES.find(
    (d) => d.id === typeLabelOrId || d.label.toLowerCase() === typeLabelOrId.toLowerCase()
  );
  return found || {
    id: "OTHER",
    label: typeLabelOrId,
    color: "#64748b",
    badgeClass: "badge-gray",
  };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 o";
  const num = typeof bytes === "bigint" ? Number(bytes) : Number(bytes);
  if (isNaN(num)) return "Taille inconnue";

  if (num < 1024) return `${num} o`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} Ko`;
  return `${(num / (1024 * 1024)).toFixed(2)} Mo`;
}

export const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:5000";
