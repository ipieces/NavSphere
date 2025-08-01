'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/registry/new-york/ui/form"
import { NavigationSubItem } from "@/types/navigation"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Switch } from "@/registry/new-york/ui/switch"
import { useState } from "react"

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "网站标题至少需要2个字符" }),
  href: z.string().url({ message: "请输入有效的网站链接" }),
  icon: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  private: z.boolean().default(false),
})

interface AddItemFormProps {
  onSubmit: (values: NavigationSubItem) => Promise<void>
  onCancel: () => void
  defaultValues?: NavigationSubItem
}

export function AddItemForm({ onSubmit, onCancel, defaultValues }: AddItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      id: String(Date.now()),
      title: "",
      href: "",
      icon: "",
      description: "",
      enabled: true,
      private: false,
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const [isUploading, setIsUploading] = useState(false)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        try {
          const values: NavigationSubItem = {
            id: data.id || await crypto.randomUUID(),
            title: data.title,
            href: data.href,
            description: data.description,
            icon: data.icon,
            enabled: data.enabled,
            private: data.private
          }
          await onSubmit(values)
        } catch (error) {
          console.error('保存失败:', error)
        }
      })} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站标题</FormLabel>
              <FormControl>
                <Input placeholder="输入网站标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站链接</FormLabel>
              <FormControl>
                <Input placeholder="输入网站链接" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>图标</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="输入图标URL"
                    {...field}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="relative"
                    disabled={isUploading}
                    onClick={() => {
                      const fileInput = document.getElementById('icon-upload');
                      fileInput?.click();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Icons.upload className="mr-2 h-4 w-4" />
                        上传图片
                      </>
                    )}
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploading(true);
                            
                            // 将文件转换为 base64
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });

                            const response = await fetch('/api/resource', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                image: base64 // 直接发送 base64 字符串
                              }),
                            });

                            if (!response.ok) {
                              throw new Error(`上传失败: ${response.status} ${response.statusText}`);
                            }

                            const data = await response.json();
                            
                            if (data.imageUrl) {
                              field.onChange(`${data.imageUrl}`); // 使用返回的图片URL
                            } else {
                              throw new Error('未获取到上传后的图片URL');
                            }
                            
                          } catch (error) {
                            console.error('上传失败:', error);
                            alert(error instanceof Error ? error.message : '上传失败，请重试');
                          } finally {
                            setIsUploading(false);
                            // 清空文件输入
                            const fileInput = document.getElementById('icon-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                支持 URL 或上传本地图片
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="输入网站描述" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  启用状态
                </FormLabel>
                <FormDescription>
                  设置该导航项是否启用
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="private"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  私密模式
                </FormLabel>
                <FormDescription>
                  开启后仅管理员可见此导航项
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  )
}