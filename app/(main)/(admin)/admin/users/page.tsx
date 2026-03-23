"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/app/components/Button";
import { TextInput } from "@/app/components/TextInput";
import Toast from "@/app/components/Toast";
import Spinner from "@/app/components/Spinner";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { UserProfile } from "@/app/utils/interfaces";
import { X, Check, Search, Terminal, Trash2 } from "lucide-react";

interface City {
  id: string;
  cityId: string;
  name: string;
}

const VALID_ROLES = ["user", "secretary", "reviewer", "admin"];

const AVAILABLE_ROLES = [
  { value: "user", label: "Proponente" },
  { value: "secretary", label: "Secretário" },
  { value: "reviewer", label: "Parecerista" },
  { value: "admin", label: "Administrador" },
];

const UsersManagement = () => {
  const { dbUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [cleaningRoles, setCleaningRoles] = useState(false);

  const isAdmin =
    Array.isArray(dbUser?.userRole) && dbUser.userRole.includes("admin");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/home");
      return;
    }
    fetchCities();
  }, [isAdmin, router]);

  useEffect(() => {
    if (selectedCityId) {
      fetchUsers();
    }
  }, [selectedCityId]);

  const fetchCities = async () => {
    try {
      const citiesSnapshot = await getDocs(collection(db, "cities"));
      const citiesData = citiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as City[];
      setCities(citiesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!selectedCityId) return;

    setLoading(true);
    try {
      const city = cities.find((c) => c.id === selectedCityId);
      if (!city) return;

      const usersQuery = query(
        collection(db, "users"),
        where("cityId", "==", city.cityId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user: any) => !user.deleted) as (UserProfile & { id: string })[];

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoles = (user: UserProfile & { id: string }) => {
    setEditingUser(user.id);
    setEditingRoles(user.userRole || []);
  };

  const handleToggleRole = (role: string) => {
    setEditingRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async (userId: string) => {
    setSaving(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        userRole: editingRoles,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, userRole: editingRoles } : u
        )
      );

      setToastMessage("Funções do usuário atualizadas com sucesso!");
      setToastType("success");
      setShowToast(true);
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving roles:", error);
      setToastMessage("Erro ao atualizar funções do usuário.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setSaving(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditingRoles([]);
  };

  const handleSoftDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja desativar o usuário ${userEmail}?`)) {
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: dbUser?.id,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      setToastMessage(`Usuário ${userEmail} desativado com sucesso.`);
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error soft deleting user:", error);
      setToastMessage("Erro ao desativar usuário.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleCleanAllInvalidRoles = async () => {
    if (!selectedCityId || cleaningRoles) return;
    
    setCleaningRoles(true);
    let totalCleaned = 0;
    
    try {
      for (const user of users) {
        const currentRoles = user.userRole || [];
        const validRoles = currentRoles.filter((role) => VALID_ROLES.includes(role));
        
        if (validRoles.length !== currentRoles.length) {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            userRole: validRoles,
            updatedAt: new Date(),
            updatedBy: dbUser?.id,
          });
          totalCleaned++;
        }
      }

      await fetchUsers();
      setToastMessage(`Limpeza concluída: ${totalCleaned} usuário(s) atualizados.`);
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error cleaning all roles:", error);
      setToastMessage("Erro ao limpar funções inválidas.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setCleaningRoles(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) return null;

  return (
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mt-4 mb-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/admin")}
          size="medium"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gerenciar Usuários
        </h2>
      </div>

      {/* City Selector */}
      <div className="w-full rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Selecione o Município
        </label>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">Selecione um município...</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCityId && (
        <>
          {/* Search and Actions */}
          <div className="w-full rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <Button
                label={cleaningRoles ? "Limpando..." : "Limpar Funções Inválidas"}
                onClick={handleCleanAllInvalidRoles}
                disabled={cleaningRoles || loading}
                variant="outlined"
                size="medium"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="w-full rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mb-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Nenhum usuário encontrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                        Nome
                      </th>
                      <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                        Email
                      </th>
                      <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                        Funções
                      </th>
                      <th className="text-center p-3 text-slate-700 dark:text-slate-300 font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      >
                        <td className="p-3 text-slate-900 dark:text-slate-100">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td className="p-3">
                          {editingUser === user.id ? (
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_ROLES.map((role) => (
                                <button
                                  key={role.value}
                                  onClick={() => handleToggleRole(role.value)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    editingRoles.includes(role.value)
                                      ? "bg-primary-500 text-white"
                                      : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {role.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {(user.userRole || []).map((role) => (
                                <span
                                  key={role}
                                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
                                >
                                  {AVAILABLE_ROLES.find((r) => r.value === role)
                                    ?.label || role}
                                </span>
                              ))}
                              {(!user.userRole || user.userRole.length === 0) && (
                                <span className="text-slate-400 dark:text-slate-500 text-sm">
                                  Sem funções
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            {editingUser === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveRoles(user.id)}
                                  disabled={saving === user.id}
                                  className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2 rounded-lg bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => console.log(`Roles for ${user.email}:`, user.userRole)}
                                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                                  title="Log roles to console"
                                >
                                  <Terminal className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSoftDeleteUser(user.id, user.email)}
                                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                  title="Desativar usuário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <Button
                                  label="Editar"
                                  onClick={() => handleEditRoles(user)}
                                  size="small"
                                  variant="outlined"
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default UsersManagement;
