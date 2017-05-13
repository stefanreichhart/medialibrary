import { MediaLibraryAngularPage } from './app.po';

describe('media-library-angular App', () => {
  let page: MediaLibraryAngularPage;

  beforeEach(() => {
    page = new MediaLibraryAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
