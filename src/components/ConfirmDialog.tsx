/**
 * Confirm Dialog
 *
 * Simple confirm/cancel modal used for deletion confirmations.
 *
 * Customization:
 *  - Width: change max-w-xs
 *  - Button colors: change bg-destructive / bg-secondary
 */
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmDialog({ open, title, message, description, confirmLabel, confirmText, onConfirm, onCancel, isDangerous }: ConfirmDialogProps) {
  const finalMessage = message || description || '';
  const finalConfirmLabel = confirmLabel || confirmText || 'Delete';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="relative z-10 w-full max-w-xs rounded-2xl bg-card p-5 shadow-float text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-5">{finalMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${isDangerous ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              >
                {finalConfirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
