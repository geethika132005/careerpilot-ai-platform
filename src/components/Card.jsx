import React from "react";

const Card = React.forwardRef(({ app, col, provided, snapshot }, ref) => {
  return (
    <div
      ref={ref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        background: "#ffffff",
        border: "1px solid #e8e5de",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        cursor: "grab",
        boxShadow: snapshot?.isDragging
          ? "0 12px 24px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        transform: snapshot?.isDragging ? "scale(1.03)" : "scale(1)",
        transition: "all 0.18s ease",
        ...(provided?.draggableProps?.style || {}),
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")
      }
    >
      {/* TOP */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {/* LOGO */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: app.color || "#4f6ef7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {app.company
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        {/* TITLE */}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1a1916",
            }}
          >
            {app.company}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#8a8680",
            }}
          >
            {app.role}
          </div>
        </div>
      </div>

      {/* META */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          fontSize: 11.5,
          color: "#8a8680",
        }}
      >
        <span>📍 {app.location || "Remote"}</span>
        <span>💰 {app.salary || "—"}</span>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* STATUS */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 9px",
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 600,
            background: col.bg,
            color: col.color,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: col.color,
            }}
          ></span>
          {app.status}
        </span>

        {/* DATE */}
        <span
          style={{
            fontSize: 11,
            color: "#b5b2ab",
            fontFamily: "monospace",
          }}
        >
          {app.date}
        </span>
      </div>
    </div>
  );
});

export default Card;
