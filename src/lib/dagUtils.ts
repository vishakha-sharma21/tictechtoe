import { type Node } from 'reactflow'

export const sanitizeNodes = (nodes: any[]): any[] => {
  if (!nodes || !Array.isArray(nodes)) return []
  return nodes
    .filter((n: any) => n != null && n.id != null)
    .map((n: any, index: number) => ({
      ...n,
      type: n?.type ?? 'default',
      position: {
        x: typeof n?.position?.x === 'number' ? n.position.x : 250,
        y: typeof n?.position?.y === 'number' ? n.position.y : index * 150
      },
      data: {
        label: n?.data?.label ?? n?.id ?? 'Node',
        tool: n?.data?.tool ?? '',
        params: n?.data?.params ?? {},
        status: n?.data?.status ?? 'pending',
        ...n?.data
      }
    }))
}

export const sanitizeEdges = (edges: any[]): any[] => {
  if (!edges || !Array.isArray(edges)) return []
  return edges.filter((e: any) => e != null && e.id && e.source && e.target)
}
