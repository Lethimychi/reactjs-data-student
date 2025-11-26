// components/ValidationError.tsx

interface Props {
  message?: string;
}

export default function ValidationError({ message }: Props) {
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>;
}
