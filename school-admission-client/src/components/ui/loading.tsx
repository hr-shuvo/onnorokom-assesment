import { Loader2Icon } from "lucide-react"
import { cn } from "cn"

const Loading = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="loading"
      className={cn(
        "flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <Loader2Icon className="size-4 animate-spin" />
      Loading...
    </div>
  )
}

export { Loading }
