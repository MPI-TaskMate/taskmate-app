import styles from "../styles/deleteTaskModal.module.css";

type DeleteTaskModalProps = {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteTaskModal({
  taskTitle,
  onConfirm,
  onCancel,
}: DeleteTaskModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.deleteModalHeader}>
          <h3>Delete task?</h3>
          <p>
            Are you sure you want to delete{" "}
            <span className={styles.deleteTaskTitle}>"{taskTitle}"</span>? This
            action cannot be undone.
          </p>
        </div>

        <div className={styles.deleteModalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirmDeleteButton}
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
