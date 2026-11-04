import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="مسیر صفحه" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? item.label}-${index}`}
              aria-current={isCurrent ? 'page' : undefined}
              className="inline-flex min-w-0 items-center gap-2"
            >
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
              )}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="rounded-sm underline-offset-4 hover:text-primary-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="min-w-0 break-words">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
