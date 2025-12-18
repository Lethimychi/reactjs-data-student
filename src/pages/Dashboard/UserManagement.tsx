import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";

type UserRole = "GiangVien" | "SinhVien";

type User = {
  id: number;
  code?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
};

const initialTeachers: User[] = [
  {
    id: 1,
    code: "0507450048",
    name: "Nguyễn Văn A",
    email: "a.nguyen@school.edu",
    role: "GiangVien",
    phone: "0123456789",
  },
  {
    id: 2,
    code: "0507450049",
    name: "Trần Thị B",
    email: "b.tran@school.edu",
    role: "GiangVien",
    phone: "0987654321",
  },
  {
    id: 3,
    code: "0507450050",
    name: "Lê Văn C",
    email: "c.le@school.edu",
    role: "GiangVien",
    phone: "0911222333",
  },
  {
    id: 4,
    code: "0507450051",
    name: "Phạm Thị D",
    email: "d.pham@school.edu",
    role: "GiangVien",
    phone: "0900111222",
  },
  {
    id: 5,
    code: "0507450052",
    name: "Hoàng Văn E",
    email: "e.hoang@school.edu",
    role: "GiangVien",
    phone: "0933444555",
  },
];

const initialStudents: User[] = [
  {
    id: 101,
    code: "SV0501001",
    name: "Nguyễn Quốc 1",
    email: "sv1@student.edu",
    role: "SinhVien",
    phone: "0351111222",
  },
  {
    id: 102,
    code: "SV0501002",
    name: "Lê Thị 2",
    email: "sv2@student.edu",
    role: "SinhVien",
    phone: "0352222333",
  },
  {
    id: 103,
    code: "SV0501003",
    name: "Phạm Văn 3",
    email: "sv3@student.edu",
    role: "SinhVien",
    phone: "0353333444",
  },
  {
    id: 104,
    code: "SV0501004",
    name: "Trần Thị 4",
    email: "sv4@student.edu",
    role: "SinhVien",
    phone: "0354444555",
  },
  {
    id: 105,
    code: "SV0501005",
    name: "Hoàng Văn 5",
    email: "sv5@student.edu",
    role: "SinhVien",
    phone: "0355555666",
  },
];

const TableHeader = ({ columns }: { columns: string[] }) => (
  <thead>
    <tr>
      {columns.map((c) => (
        <th
          key={c}
          className="px-4 py-2 text-left text-sm font-medium text-gray-600"
        >
          {c}
        </th>
      ))}
      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
        Hành động
      </th>
    </tr>
  </thead>
);

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<"GiangVien" | "SinhVien">(
    "GiangVien"
  );
  const [teachers, setTeachers] = useState<User[]>(initialTeachers);
  const [students, setStudents] = useState<User[]>(initialStudents);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<User>>({});

  const list = useMemo(
    () => (activeTab === "GiangVien" ? teachers : students),
    [activeTab, teachers, students]
  );

  function startAdd() {
    setEditingId(null);
    setForm({ code: "", name: "", email: "", phone: "", role: activeTab });
  }

  function startEdit(u: User) {
    setEditingId(u.id);
    setForm({ ...u });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  function save() {
    if (!form.name || !form.email) {
      alert("Vui lòng nhập tên và email");
      return;
    }

    const target = activeTab === "GiangVien" ? teachers : students;

    if (editingId == null) {
      // add
      const maxId = Math.max(0, ...target.map((t) => t.id));
      const newUser: User = {
        id: maxId + 1,
        code:
          (form.code as string) ||
          `${activeTab === "GiangVien" ? "GV" : "SV"}${maxId + 1}`,
        name: form.name as string,
        email: form.email as string,
        phone: form.phone,
        role: activeTab,
      };
      if (activeTab === "GiangVien")
        setTeachers((s) => [newUser, ...s].slice(0, 50));
      else setStudents((s) => [newUser, ...s].slice(0, 50));
    } else {
      // update
      if (activeTab === "GiangVien") {
        setTeachers((s) =>
          s.map((t) =>
            t.id === editingId ? { ...(t as User), ...(form as User) } : t
          )
        );
      } else {
        setStudents((s) =>
          s.map((t) =>
            t.id === editingId ? { ...(t as User), ...(form as User) } : t
          )
        );
      }
    }

    cancelEdit();
  }

  function remove(id: number) {
    if (!confirm("Xác nhận xóa người dùng này?")) return;
    if (activeTab === "GiangVien")
      setTeachers((s) => s.filter((t) => t.id !== id));
    else setStudents((s) => s.filter((t) => t.id !== id));
  }

  return (
    <div className="p-6">
      <PageMeta
        title="Quản lý người dùng"
        description="CRUD giảng viên và sinh viên"
      />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quản lý người dùng</h2>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab("GiangVien")}
            className={`px-3 py-1 rounded ${
              activeTab === "GiangVien"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Giảng viên
          </button>
          <button
            onClick={() => setActiveTab("SinhVien")}
            className={`px-3 py-1 rounded ${
              activeTab === "SinhVien"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Sinh viên
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="space-x-2">
          <button
            onClick={startAdd}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full table-auto">
          <TableHeader columns={["Mã", "Tên", "Email", "Số điện thoại"]} />
          <tbody>
            {editingId === null && form.name && (
              <tr className="bg-yellow-50">
                <td className="px-4 py-2">
                  <input
                    className="border px-2 py-1 w-full"
                    placeholder="Mã người dùng"
                    value={form.code || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    className="border px-2 py-1 w-full"
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    className="border px-2 py-1 w-full"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    className="border px-2 py-1 w-full"
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={save}
                    className="mr-2 px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Hủy
                  </button>
                </td>
              </tr>
            )}

            {list.slice(0, 5).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 align-top">
                  {editingId === u.id ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={form.code || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, code: e.target.value }))
                      }
                    />
                  ) : (
                    u.code || String(u.id)
                  )}
                </td>
                <td className="px-4 py-2 align-top">
                  {editingId === u.id ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={form.name || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="px-4 py-2 align-top">
                  {editingId === u.id ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={form.email || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="px-4 py-2 align-top">
                  {editingId === u.id ? (
                    <input
                      className="border px-2 py-1 w-full"
                      value={form.phone || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  ) : (
                    u.phone || "—"
                  )}
                </td>
                <td className="px-4 py-2 align-top">
                  {editingId === u.id ? (
                    <>
                      <button
                        onClick={save}
                        className="mr-2 px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="mr-2 px-3 py-1 bg-yellow-400 text-white rounded"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
