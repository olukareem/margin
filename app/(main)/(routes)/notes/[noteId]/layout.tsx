import { Navbar } from "../../../_components/navbar";

const NoteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default NoteLayout;
