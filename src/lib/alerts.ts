import Swal from 'sweetalert2';

export const alerts = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      background: '#1e232a',
      color: '#f3f4f6',
      confirmButtonColor: '#eab308',
      timer: 2000,
      timerProgressBar: true
    });
  },
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      background: '#1e232a',
      color: '#f3f4f6',
      confirmButtonColor: '#dc2626'
    });
  },
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      background: '#1e232a',
      color: '#f3f4f6',
      confirmButtonColor: '#eab308'
    });
  },
  confirm: async (title: string, text: string, confirmText = 'Sim, desativar'): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      background: '#1e232a',
      color: '#f3f4f6'
    });
    return result.isConfirmed;
  }
};
