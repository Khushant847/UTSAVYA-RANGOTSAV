"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminRecord {
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
}

export function AdminSettings() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/list");
        const data = await response.json();
        setAdmins(data.admins || []);
      } catch {
        toast.error("Failed to load admins");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-sm text-purple-200/60">Manage admin accounts and roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Registered Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-purple-200/50">
                      Loading admins...
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-purple-200/50">
                      <Users className="mx-auto mb-2 h-8 w-8" />
                      No admins found. Add admin users in the Firestore &quot;admins&quot; collection.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin, index) => (
                    <TableRow key={admin.email || index}>
                      <TableCell className="font-medium">{admin.email}</TableCell>
                      <TableCell>{admin.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={admin.role === "super_admin" ? "gold" : "secondary"} className="text-[10px]">
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.isActive ? (
                          <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                        ) : (
                          <Badge variant="error" className="text-[10px]">INACTIVE</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 rounded-xl border border-purple-500/15 bg-purple-500/[0.05] p-4 text-xs text-purple-200/70">
            <p className="font-semibold text-amber-300 mb-1">How to add admins:</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Create the user account in Firebase Authentication (Email/Password provider).</li>
              <li>
                Add a document in the <code className="text-amber-300">admins</code> collection using the
                user&apos;s UID as the document ID.
              </li>
              <li>
                Document fields: <code className="text-amber-300">email</code>,{" "}
                <code className="text-amber-300">displayName</code>,{" "}
                <code className="text-amber-300">role</code> (&quot;super_admin&quot; | &quot;scanner&quot; | &quot;viewer&quot;),{" "}
                <code className="text-amber-300">isActive</code> (true),{" "}
                <code className="text-amber-300">createdAt</code>.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}