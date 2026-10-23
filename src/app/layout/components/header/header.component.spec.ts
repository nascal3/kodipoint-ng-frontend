import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb navigation with default title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumbRoot = compiled.querySelector('.breadcrumb-root');
    const breadcrumbCurrent = compiled.querySelector('.breadcrumb-current');
    expect(breadcrumbRoot?.textContent?.trim()).toBe('KodiPoint');
    expect(breadcrumbCurrent?.textContent?.trim()).toBe('Dashboard');
  });

  it('should not render toggle button when sidebar is expanded', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.toggle-btn')).toBeNull();
  });

  it('should render toggle button when sidebar is collapsed and emit toggleSidebar on click', () => {
    fixture.componentRef.setInput('sidebarCollapsed', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toggleBtn = compiled.querySelector('.toggle-btn') as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();

    let emitted = false;
    component.toggleSidebar.subscribe(() => {
      emitted = true;
    });

    toggleBtn.click();
    expect(emitted).toBe(true);
  });

  it('should render notification button with alert indicator dot', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notificationBtn = compiled.querySelector('.notification-btn');
    const notificationDot = compiled.querySelector('.notification-dot');
    expect(notificationBtn).toBeTruthy();
    expect(notificationDot).toBeTruthy();
  });

  it('should render user profile information and avatar in trigger button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const userName = compiled.querySelector('.user-name');
    const initials = compiled.querySelector('.avatar-initials');
    expect(userName?.textContent?.trim()).toBe('John Doe');
    expect(initials?.textContent?.trim()).toBe('JD');
  });

  it('should open profile menu on trigger click and display user details and menu options', async () => {
    const triggerBtn = fixture.nativeElement.querySelector(
      '.user-profile-trigger',
    ) as HTMLButtonElement;
    expect(triggerBtn).toBeTruthy();

    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const overlay = document.querySelector('.user-profile-menu-panel');
    expect(overlay).toBeTruthy();

    const headerName = overlay?.querySelector('.header-name');
    const headerEmail = overlay?.querySelector('.header-email');
    expect(headerName?.textContent?.trim()).toBe('John Doe');
    expect(headerEmail?.textContent?.trim()).toBe('john.doe@estateops.com');

    const menuItems = overlay?.querySelectorAll('.profile-menu-item');
    expect(menuItems?.length).toBe(3);

    const menuTexts = Array.from(menuItems || []).map((el) => el.textContent?.trim());
    expect(menuTexts.some((t) => t?.includes('Profile'))).toBe(true);
    expect(menuTexts.some((t) => t?.includes('SettingsService'))).toBe(true);
    expect(menuTexts.some((t) => t?.includes('Logout'))).toBe(true);
  });

  it('should emit events when menu options are clicked', async () => {
    const triggerBtn = fixture.nativeElement.querySelector(
      '.user-profile-trigger',
    ) as HTMLButtonElement;
    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    let profileEmitted = false;
    let settingsEmitted = false;
    let logoutEmitted = false;

    component.profileSelected.subscribe(() => (profileEmitted = true));
    component.settingsSelected.subscribe(() => (settingsEmitted = true));
    component.logout.subscribe(() => (logoutEmitted = true));

    const menuItems = document.querySelectorAll(
      '.profile-menu-item',
    ) as NodeListOf<HTMLButtonElement>;

    // Find and click profile
    const profileItem = Array.from(menuItems).find((el) => el.textContent?.includes('Profile'));
    profileItem?.click();
    expect(profileEmitted).toBe(true);

    // Reopen menu for settings
    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const newMenuItems = document.querySelectorAll(
      '.profile-menu-item',
    ) as NodeListOf<HTMLButtonElement>;
    const settingsItem = Array.from(newMenuItems).find((el) =>
      el.textContent?.includes('SettingsService'),
    );
    settingsItem?.click();
    expect(settingsEmitted).toBe(true);

    // Reopen menu for logout
    triggerBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const finalMenuItems = document.querySelectorAll(
      '.profile-menu-item',
    ) as NodeListOf<HTMLButtonElement>;
    const logoutItem = Array.from(finalMenuItems).find((el) => el.textContent?.includes('Logout'));
    logoutItem?.click();
    expect(logoutEmitted).toBe(true);
  });
});
