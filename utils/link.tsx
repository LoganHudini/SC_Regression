import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';

const LinkComponent = ({
  children,
  skipLocaleHandling,
  ...rest
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
    skipLocaleHandling?: boolean;
    href: string;
  } & React.RefAttributes<HTMLAnchorElement>) => {
  const router = useRouter();
  const locale = rest.locale || router.query.locale || '';

  let href = rest.href || router.asPath;
  if (href.indexOf('http') === 0) skipLocaleHandling = true;
  if (locale && !skipLocaleHandling) {
    href = href ? `/${locale}${href}` : router.pathname.replace('[locale]', locale as string);
  }

  return (
    <Link prefetch={false} {...rest} href={href}>
      {children}
    </Link>
  );
};

export default LinkComponent;
