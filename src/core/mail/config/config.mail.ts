import Handlebars from 'handlebars';
import * as ejs from 'ejs';
import { fileToString } from '../utils/fileToString';

export const templateToString = function (
  plantilla: string = '',
  data: Record<string, unknown> = {},
): string {
  try {
    const path: string =
      process.cwd() + `/src/core/mail/pages/${plantilla}.html`;

    const html: string = fileToString(path);

    const rest_html: string = ejs.render(html, data);

    const template: HandlebarsTemplateDelegate = Handlebars.compile(rest_html);

    const htmlToString: string = template({ op: true });

    return htmlToString;
  } catch (err) {
    console.log(err);

    throw new Error(
      'Error al leer o procesar la plantilla HTML: ' + err.message,
    );
  }
};
