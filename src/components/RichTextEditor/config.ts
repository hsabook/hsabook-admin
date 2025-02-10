import type { EditorOptions } from 'tinymce';
import CONFIG_APP from '../../utils/config';

export const EDITOR_OPTIONS: Partial<EditorOptions> = {
  height: 500,
  menubar: false,
  readonly: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount',
    'tiny_mce_wiris'
  ],
  toolbar: [
    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify',
    'bullist numlist outdent indent | removeformat | link image media',
    'tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry'
  ].join(' | '),
  branding: false,
  statusbar: false,
  image_title: true,
  automatic_uploads: true,
  images_upload_url: CONFIG_APP.API_ENDPOINT + '/media/upload', // Add API endpoint
  images_upload_handler: async function (blobInfo, progress) {
    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    try {
      const response = await fetch(CONFIG_APP.API_ENDPOINT + '/media/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Image upload failed');
    }
  },
  file_picker_types: 'image',
  extended_valid_elements: '*[.*]',
  skin: 'oxide',
  icons: 'default',
  promotion: false,
  resize: true,
  min_height: 300,
  max_height: 800,
  autoresize_bottom_margin: 50,
  formats: {
    bold: { inline: 'strong' },
    italic: { inline: 'em' },
    underline: { inline: 'span', styles: { 'text-decoration': 'underline' } },
    strikethrough: { inline: 'span', styles: { 'text-decoration': 'line-through' } }
  }
};