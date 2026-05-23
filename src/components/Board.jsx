import Column from "./Column";

export default function Board({ applications, search, columns }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {columns.map((col) => {
        const cards = applications
          .filter((a) => a.status === col.name)
          .filter(
            (a) =>
              a.company?.toLowerCase().includes(search.toLowerCase()) ||
              a.role?.toLowerCase().includes(search.toLowerCase()),
          );

        return <Column key={col.name} col={col} cards={cards} />;
      })}
    </div>
  );
}
