export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = Record<string, string | number | boolean | null>;

type ApiSuccess = {
  ok: true;
  rows: Row[];
};

type ApiError = {
  ok: false;
  message: string;
};

type ApiResult = ApiSuccess | ApiError;


/* =====================================================
   READ DATA FROM APPS SCRIPT
===================================================== */

async function getRows(): Promise<ApiResult> {
  const url = process.env.SHEET_API_URL?.trim();
  const key = process.env.SHEET_API_KEY?.trim();

  if (!url) {
    return {
      ok: false,
      message: "ไม่พบ SHEET_API_URL ในไฟล์ .env.local",
    };
  }

  if (!key) {
    return {
      ok: false,
      message: "ไม่พบ SHEET_API_KEY ในไฟล์ .env.local",
    };
  }

  try {
    const apiUrl = new URL(url);

    apiUrl.searchParams.set("api", "1");
    apiUrl.searchParams.set("key", key);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return {
        ok: false,
        message: "Apps Script ตอบกลับมาแล้ว แต่ข้อมูลไม่ใช่ JSON",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        message: `Apps Script ตอบกลับ HTTP ${response.status}`,
      };
    }

    if (!data.ok) {
      return {
        ok: false,
        message: data.message || "อ่านข้อมูลไม่สำเร็จ",
      };
    }

    return {
      ok: true,
      rows: Array.isArray(data.rows) ? data.rows : [],
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "เชื่อมต่อ Apps Script ไม่สำเร็จ",
    };
  }
}


/* =====================================================
   HELPERS
===================================================== */

function num(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("th-TH");
}


/* =====================================================
   PAGE
===================================================== */

export default async function Page() {
  const result = await getRows();

  if (!result.ok) {
    return (
      <main
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          padding: 24,
          fontFamily: '"Sarabun", Tahoma, sans-serif',
        }}
      >
        <h1>ระบบสารสนเทศและเครือข่าย</h1>
        <p>สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาหนองคาย</p>

        <div
          style={{
            marginTop: 30,
            padding: 24,
            background: "#fff8e7",
            border: "1px solid #ead7a8",
            borderRadius: 8,
          }}
        >
          <h2>ยังแสดงข้อมูลไม่ได้</h2>
          <p>{result.message}</p>
        </div>
      </main>
    );
  }

  const rows = result.rows;

  const totalStudents = rows.reduce(
    (sum, row) => sum + num(row["นักเรียนรวม"]),
    0
  );

  const totalMale = rows.reduce(
    (sum, row) => sum + num(row["นักเรียนชาย"]),
    0
  );

  const totalFemale = rows.reduce(
    (sum, row) => sum + num(row["นักเรียนหญิง"]),
    0
  );

  const schoolNames = rows
    .map((row) => String(row["โรงเรียน"] || "").trim())
    .filter(Boolean);

  const totalSchools = new Set(schoolNames).size;

  const gradeOrder = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];

  const gradeSummary = gradeOrder.map((grade) => {
    const total = rows
      .filter((row) => String(row["ระดับชั้น"] || "") === grade)
      .reduce((sum, row) => sum + num(row["นักเรียนรวม"]), 0);

    return {
      grade,
      total,
    };
  });

  const schoolMap = new Map<string, number>();

  rows.forEach((row) => {
    const school = String(row["โรงเรียน"] || "").trim();
    if (!school) return;

    schoolMap.set(
      school,
      (schoolMap.get(school) || 0) + num(row["นักเรียนรวม"])
    );
  });

  const schoolSummary = Array.from(schoolMap.entries())
    .map(([school, total]) => ({
      school,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main
      style={{
        maxWidth: 1250,
        margin: "0 auto",
        padding: "32px 24px 60px",
        fontFamily: '"Sarabun", Tahoma, sans-serif',
      }}
    >
      <header
        style={{
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontSize: 36,
            marginBottom: 8,
          }}
        >
          ระบบสารสนเทศและเครือข่าย
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#9bb0c1",
          }}
        >
          สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาหนองคาย
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <SummaryCard
          title="นักเรียนทั้งหมด"
          value={formatNumber(totalStudents)}
        />

        <SummaryCard
          title="นักเรียนชาย"
          value={formatNumber(totalMale)}
        />

        <SummaryCard
          title="นักเรียนหญิง"
          value={formatNumber(totalFemale)}
        />

        <SummaryCard
          title="โรงเรียนที่มีข้อมูล"
          value={formatNumber(totalSchools)}
        />
      </section>

      <section
        className="analytics-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <h2>จำนวนนักเรียนรายระดับชั้น</h2>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gap: 14,
            }}
          >
            {gradeSummary.map((item) => {
              const percent =
                totalStudents > 0
                  ? (item.total / totalStudents) * 100
                  : 0;

              return (
                <div key={item.grade}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span>{item.grade}</span>
                    <strong>{formatNumber(item.total)}</strong>
                  </div>

                  <div
                    style={{
                      height: 10,
                      background: "#dce9f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percent}%`,
                        background: "#168da4",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>สรุปรายโรงเรียน</h2>

          <div
            style={{
              marginTop: 16,
              maxHeight: 330,
              overflowY: "auto",
            }}
          >
            {schoolSummary.length === 0 ? (
              <p>ยังไม่มีข้อมูลโรงเรียน</p>
            ) : (
              schoolSummary.map((item, index) => (
                <div
                  key={item.school}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    padding: "12px 0",
                    borderBottom: "1px solid #dce6ef",
                  }}
                >
                  <span>
                    {index + 1}. {item.school}
                  </span>

                  <strong>{formatNumber(item.total)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2>รายการข้อมูลล่าสุด</h2>

        <div
          style={{
            overflowX: "auto",
            marginTop: 16,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 850,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#e4f0fa",
                  color: "#173653",
                }}
              >
                <th style={thStyle}>ปีการศึกษา</th>
                <th style={thStyle}>โรงเรียน</th>
                <th style={thStyle}>ระดับชั้น</th>
                <th style={thStyle}>ชาย</th>
                <th style={thStyle}>หญิง</th>
                <th style={thStyle}>รวม</th>
                <th style={thStyle}>แหล่งข้อมูล</th>
                <th style={thStyle}>ผู้บันทึก</th>
              </tr>
            </thead>

            <tbody>
              {rows
                .slice()
                .reverse()
                .slice(0, 20)
                .map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #e1eaf2",
                    }}
                  >
                    <td style={tdStyle}>{String(row["ปีการศึกษา"] || "-")}</td>
                    <td style={tdStyle}>{String(row["โรงเรียน"] || "-")}</td>
                    <td style={tdStyle}>{String(row["ระดับชั้น"] || "-")}</td>
                    <td style={tdStyle}>
                      {formatNumber(num(row["นักเรียนชาย"]))}
                    </td>
                    <td style={tdStyle}>
                      {formatNumber(num(row["นักเรียนหญิง"]))}
                    </td>
                    <td style={tdStyle}>
                      {formatNumber(num(row["นักเรียนรวม"]))}
                    </td>
                    <td style={tdStyle}>{String(row["แหล่งข้อมูล"] || "-")}</td>
                    <td style={tdStyle}>{String(row["ผู้บันทึก"] || "-")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}


/* =====================================================
   COMPONENTS
===================================================== */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          color: "#92a6ba",
          fontSize: 15,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#1769a5",
        }}
      >
        {value}
      </div>
    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, #ffffff, #f7fbff)",
  border: "1px solid #d4e2ef",
  borderRadius: 8,
  padding: 22,
  boxShadow: "0 8px 24px rgba(31,77,115,.08), inset 0 1px #ffffff",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
};

const tdStyle: React.CSSProperties = {
  padding: 12,
};