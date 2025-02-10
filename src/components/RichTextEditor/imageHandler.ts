export const handleImageUpload = (callback: Function, meta: any) => {
  if (meta.filetype === 'image') {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = function () {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        callback(e.target?.result, { alt: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }
};