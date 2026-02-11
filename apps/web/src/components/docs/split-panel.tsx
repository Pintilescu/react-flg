interface SplitSectionProps {
  prose: React.ReactNode;
  code: React.ReactNode;
}

export function SplitSection({ prose, code }: SplitSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div>{prose}</div>
      <div className="lg:sticky lg:top-24 lg:self-start">{code}</div>
    </div>
  );
}
