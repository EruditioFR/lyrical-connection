import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInvoices } from "@/hooks/useInvoices";
import { 
  Download, 
  ExternalLink, 
  RefreshCw, 
  FileText,
  Calendar,
  Euro,
  Receipt
} from 'lucide-react';

const InvoicesList = () => {
  const { 
    invoices, 
    isLoading, 
    syncInvoices, 
    isSyncing,
    formatAmount, 
    formatDate, 
    getStatusBadgeVariant, 
    getStatusText,
    totalPaid,
    totalDue,
    invoiceCount
  } = useInvoices();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sync button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Facturation</h2>
          <p className="text-muted-foreground">
            Consultez et téléchargez vos factures
          </p>
        </div>
        <Button 
          onClick={() => syncInvoices()} 
          disabled={isSyncing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total factures</p>
                <p className="text-2xl font-bold">{invoiceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Euro className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Montant payé</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Euro className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatAmount(totalDue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices list */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de factures ou elles n'ont pas été synchronisées.
            </p>
            <Button onClick={() => syncInvoices()} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Synchroniser les factures
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {invoice.invoice_number || `Facture ${invoice.stripe_invoice_id.slice(-8)}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.description}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {getStatusText(invoice.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-semibold">
                        {formatAmount(invoice.amount_paid > 0 ? invoice.amount_paid : invoice.amount_due, invoice.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date création</p>
                      <p className="font-semibold">{formatDate(invoice.created_at)}</p>
                    </div>
                  </div>
                  
                  {invoice.due_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Échéance</p>
                        <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(invoice.period_start || invoice.period_end) && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm text-muted-foreground">
                      <strong>Période de facturation:</strong>{' '}
                      {invoice.period_start && formatDate(invoice.period_start)}
                      {invoice.period_start && invoice.period_end && ' - '}
                      {invoice.period_end && formatDate(invoice.period_end)}
                    </div>
                  </>
                )}

                <Separator className="my-3" />
                
                <div className="flex flex-wrap gap-2">
                  {invoice.invoice_pdf && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  )}
                  
                  {invoice.hosted_invoice_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir en ligne
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesList;