export default function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z"
      />
    </svg>
  );
}
