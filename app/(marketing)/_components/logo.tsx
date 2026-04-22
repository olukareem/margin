import Link from "next/link";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line
          x1="6"
          y1="2"
          x2="6"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="11" r="2.5" fill="currentColor" />
      </svg>
      <p className="font-serif text-xl leading-none">Margin</p>
    </Link>
  );
};
