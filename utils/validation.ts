export const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };
  
  export const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50;
  };
  
  export const validateVideoFile = (file: File): boolean => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 100 * 1024 * 1024; // 100MB
  
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };
  
  export const validateNoteFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
  
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };