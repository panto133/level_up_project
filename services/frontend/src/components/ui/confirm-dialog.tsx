// confirm-dialog.tsx - Reusable confirmation dialog component
interface ConfirmDialogProps {
    isOpen: boolean;        // Controls dialog visibility
    title: string;         // Dialog title
    message: string;       // Main message content
    onConfirm: () => void; // Handler for confirm action
    onCancel: () => void;  // Handler for cancel action
  }

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  // Don't render anything if dialog is not open
  if (!isOpen) return null;

  /**
   * Formats the dialog message with colored highlights for valid/invalid counts
   * @param message The message to format
   * @returns Formatted message with colored spans for numbers
   */
  const formatMessage = (message: string) => {
      // Find numeric phrases using regex
      const invalidMatch = message.match(/\d+\s+invalid\s+rows/);
      const validMatch = message.match(/\d+\s+valid\s+rows/);

      if (!invalidMatch || !validMatch) {
          return <span>{message}</span>;
      }

      // Find the positions of the matches in the original string
      const invalidIndex = message.indexOf(invalidMatch[0]);
      const validIndex = message.indexOf(validMatch[0]);

      // Split the message into parts and color them appropriately
      return (
          <>
              {message.substring(0, invalidIndex)}
              <span className="text-red-600">{invalidMatch[0]}</span>
              {message.substring(invalidIndex + invalidMatch[0].length, validIndex)}
              <span className="text-green-600">{validMatch[0]}</span>
              {message.substring(validIndex + validMatch[0].length)}
          </>
      );
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-red-600">{title}</h2>
              <p className="mb-6 text-gray-700">{formatMessage(message)}</p>
              <div className="flex justify-end space-x-4">
                  <button
                      onClick={() => onCancel()}
                      className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={() => onConfirm()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                      Confirm
                  </button>
              </div>
          </div>
      </div>
  );
}