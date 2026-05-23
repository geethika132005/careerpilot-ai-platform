import { Droppable, Draggable } from "@hello-pangea/dnd";
import Card from "./Card";

export default function Column({ col, cards }) {
  return (
    <div
      style={{
        width: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          padding: "0 4px",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1a1916",
          }}
        >
          {col.name}
        </span>

        <span
          style={{
            fontSize: 12,
            color: "#8a8680",
          }}
        >
          {cards.length}
        </span>
      </div>

      {/* COLUMN BODY */}
      <Droppable droppableId={col.name}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              background: snapshot.isDraggingOver ? "#ebe9e4" : "#f5f4f0",
              border: "1px solid #e8e5de",
              borderRadius: 12,
              padding: 10,
              minHeight: 400,
              maxHeight: "75vh",
              overflowY: "auto",
              transition: "background 0.2s ease",
            }}
          >
            {cards.map((app, index) => (
              <Draggable
                key={String(app.id)}
                draggableId={String(app.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    app={app}
                    col={col}
                    provided={provided}
                    snapshot={snapshot}
                  />
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
