import Layout from "@/components/layout/Layout";
import InvoicesList from "@/components/billing/InvoicesList";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

export default function Billing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center p-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
              <p className="text-muted-foreground mb-6">
                Vous devez être connecté pour consulter vos factures.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <InvoicesList />
      </div>
    </Layout>
  );
}