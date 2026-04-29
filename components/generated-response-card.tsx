import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GeneratedResponseCardProps {
  response: string
}

export function GeneratedResponseCard({ response }: GeneratedResponseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Response</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{response}</p>
      </CardContent>
    </Card>
  )
}
