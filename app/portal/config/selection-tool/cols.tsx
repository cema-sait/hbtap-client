// "use client";

// import type { ColumnDef } from "@tanstack/react-table";
// import type { SelectionTool } from "@/types/intervention";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

// interface ColumnActions {
//   onEdit: (tool: SelectionTool) => void;
//   onDelete: (tool: SelectionTool) => void;
// }

// export const getColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<SelectionTool>[] => [
//   {
//     accessorKey: "criteria",
//     header: "Criteria",
//     cell: ({ row }) => (
//       <span className="font-medium text-gray-900">{row.original.criteria}</span>
//     ),
//   },
//   {
//     accessorKey: "description",
//     header: "Description",
//     cell: ({ row }) => (
//       <span className="text-gray-600 line-clamp-2 max-w-xs text-sm">{row.original.description}</span>
//     ),
//   },
//   {
//     accessorKey: "mortality_score",
//     header: "Mortality Score",
//     cell: ({ row }) => {
//       const score = row.original.mortality_score;
//       return score != null ? (
//         <Badge variant={score >= 7 ? "destructive" : score >= 4 ? "secondary" : "outline"}>
//           {score}
//         </Badge>
//       ) : <span className="text-gray-400">—</span>;
//     },
//   },
//   {
//     accessorKey: "morbidity_score",
//     header: "Morbidity Score",
//     cell: ({ row }) => {
//       const score = row.original.morbidity_score;
//       return score != null ? (
//         <Badge variant={score >= 7 ? "destructive" : score >= 4 ? "secondary" : "outline"}>
//           {score}
//         </Badge>
//       ) : <span className="text-gray-400">—</span>;
//     },
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created",
//     cell: ({ row }) => (
//       <span className="text-sm text-gray-500">
//         {new Date(row.original.created_at).toLocaleDateString()}
//       </span>
//     ),
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" size="icon" className="h-8 w-8">
//             <MoreHorizontal className="h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuItem onClick={() => onEdit(row.original)}>
//             <Pencil className="h-4 w-4 mr-2" /> Edit
//           </DropdownMenuItem>
//           <DropdownMenuItem
//             className="text-red-600"
//             onClick={() => onDelete(row.original)}
//           >
//             <Trash2 className="h-4 w-4 mr-2" /> Delete
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     ),
//   },
// ];