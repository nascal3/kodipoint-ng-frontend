import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render brand logo and name in expanded mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandName = compiled.querySelector('.brand-name');
    expect(brandName?.textContent?.trim()).toBe('kodipoint');
    expect(compiled.querySelector('.brand-logo')).toBeTruthy();
  });

  it('should render all navigation sections and items when expanded', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sectionTitles = compiled.querySelectorAll('.section-title');
    expect(sectionTitles.length).toBe(3);
    expect(sectionTitles[0].textContent?.trim()).toBe('GENERAL');
    expect(sectionTitles[1].textContent?.trim()).toBe('ANALYTICS');
    expect(sectionTitles[2].textContent?.trim()).toBe('OTHER');

    const navLinks = compiled.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(8);

    const labels = Array.from(compiled.querySelectorAll('.nav-label')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Properties');
    expect(labels).toContain('Tenants');
    expect(labels).toContain('Invoices');
    expect(labels).toContain('Payments & Receipts');
    expect(labels).toContain('Reports & Analytics');
    expect(labels).toContain('Performance');
    expect(labels).toContain('Support');
  });

  it('should toggle collapsed state when toggle button is clicked', () => {
    expect(component.collapsed()).toBe(false);

    const toggleBtn = fixture.nativeElement.querySelector('.toggle-btn') as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();

    toggleBtn.click();
    fixture.detectChanges();

    expect(component.collapsed()).toBe(true);
    expect(fixture.nativeElement.classList.contains('collapsed')).toBe(true);
  });

  it('should render collapsed brand logo and hide section titles and labels when collapsed', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo-box')).toBeTruthy();
    expect(compiled.querySelector('.brand-name')).toBeNull();
    expect(compiled.querySelectorAll('.section-title').length).toBe(0);
    expect(compiled.querySelectorAll('.nav-label').length).toBe(0);

    const navIcons = compiled.querySelectorAll('.nav-icon');
    expect(navIcons.length).toBe(8);
  });

  it('should have tooltips on navigation links showing item names', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const tooltipDirectives = fixture.debugElement
      .queryAll(By.directive(MatTooltip))
      .map((de) => de.injector.get(MatTooltip));

    const messages = tooltipDirectives.map((t) => t.message);
    expect(messages).toContain('Dashboard');
    expect(messages).toContain('Properties');
    expect(messages).toContain('Tenants');
    expect(messages).toContain('Invoices');
    expect(messages).toContain('Payments & Receipts');
    expect(messages).toContain('Reports & Analytics');
    expect(messages).toContain('Performance');
    expect(messages).toContain('Support');

    // Tooltips are enabled when collapsed
    for (const tooltip of tooltipDirectives.filter((t) => t.message !== 'KodiPoint')) {
      expect(tooltip.disabled).toBe(false);
    }
  });

  it('should contain router links pointing to correct routes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardLink = compiled.querySelector('a[href="/dashboard"]');
    expect(dashboardLink).toBeTruthy();
  });
});
