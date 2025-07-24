
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Company } from "@/lib/types"
import { updateCompany, addCompany, clearCache } from "@/lib/data"
import { useDataRefresh } from "@/hooks/use-data-refresh"

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters long."),
})

type CompanyFormValues = z.infer<typeof formSchema>;

export function CompanyForm({ onFinished, company }: { onFinished: () => void, company?: Company }) {
  const { toast } = useToast()
  const { refreshData } = useDataRefresh();
  const [isSaving, setIsSaving] = React.useState(false);

  const isEditing = !!company;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company?.name ?? "",
    },
  })

  async function onSubmit(values: CompanyFormValues) {
    setIsSaving(true);
    try {
      if (isEditing && company) {
        await updateCompany(company.id, values);
        toast({
          title: "Company Updated!",
          description: `Successfully updated ${values.name}.`,
        });
      } else {
        await addCompany(values);
        toast({
          title: "Company Added!",
          description: `Successfully added ${values.name}.`,
        });
      }
      clearCache();
      refreshData();
      onFinished();
    } catch (error) {
       toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: `Could not save ${values.name}. Please try again.`,
        variant: "destructive"
      })
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Stark Industries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFinished} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Company"}
            </Button>
        </div>
      </form>
    </Form>
  )
}
