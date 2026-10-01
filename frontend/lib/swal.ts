import Swal from 'sweetalert2';

/** Notif sukses di pojok kanan atas (top-end) */
export const toastSuccess = (message: string) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    width: 'auto',
    customClass: {
      popup: '!rounded-xl !shadow-lg !text-sm',
    },
  });
};

/** Dialog konfirmasi hapus mirip logout */
export const confirmDelete = async (itemName = 'data ini') => {
  return Swal.fire({
    title: `Hapus ${itemName}?`,
    text: 'Data yang dihapus tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    width: '360px',
    padding: '1.5rem',
    customClass: {
      popup: '!rounded-2xl',
      title: '!text-lg',
      htmlContainer: '!text-sm',
    },
  });
};
