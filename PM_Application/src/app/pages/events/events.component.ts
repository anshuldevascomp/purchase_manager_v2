import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ApiService } from '../../services/api.service';

// interface EventItem {
//   id: number;
//   title: string;
//   image: string;
//   category: string;
// }

// interface CarouselSection {
//   title: string;
//   items: EventItem[];
//   currentIndex: number;
// }
interface CarouselItem {
  Id: number;
  title: string;
  image: string;
  category: string;
  description:string;
}

interface CarouselSection {
  currentIndex: number;
  items: CarouselItem[];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  apiUrl: string = ''
     carouselSections: CarouselSection[] = [];
     allevents:CarouselItem[]=[];
  EventsData: any;
  selectedItem: any = null; // To hold the clicked item
  isPopupOpen = false;
  // carouselSections: CarouselSection[] = [
  //   {
  //     title: 'UPCOMING EVENTS',
  //     currentIndex: 0,
  //     items: [
  //       { id: 1, title: 'Annual Conference', image: '/assets/event1.jpg', category: 'conference' },
  //       { id: 2, title: 'Workshop Series', image: '/assets/event2.jpg', category: 'workshop' },
  //       { id: 3, title: 'Networking Mixer', image: '/assets/event3.jpg', category: 'networking' },
  //       { id: 4, title: 'Product Launch', image: '/assets/event4.jpg', category: 'launch' },
  //     ]
  //   },
  //   {
  //     title: 'FEATURED EVENTS',
  //     currentIndex: 0,
  //     items: [
  //       { id: 5, title: 'Tech Summit', image: '/assets/event5.jpg', category: 'summit' },
  //       { id: 6, title: 'Panel Discussion', image: '/assets/event6.jpg', category: 'discussion' },
  //       { id: 7, title: 'Award Ceremony', image: '/assets/event7.jpg', category: 'awards' },
  //       { id: 8, title: 'Charity Gala', image: '/assets/event8.jpg', category: 'gala' },
  //     ]
  //   }
  // ];

  constructor(private authService: ApiService) {}

  ngOnInit(): void {
    // Auto-advance carousels
    setInterval(() => {
      this.carouselSections.forEach(section => {
        this.nextSlide(section);
      });
    }, 5000);
    this.apiUrl = this.authService.getApiUrl();
    console.log(this.apiUrl);
    this.loadEventsData();
  }
  loadEventsData(): void {
    this.authService.geteventsdata('EventData').subscribe(
      (response) => {
        console.log('EventsData:', response);
        this.carouselSections = [];
        this.EventsData = response[0].data;
        this.carouselSections = [];
        this.allevents=[];// Reset

        for (let i = 0; i < this.EventsData.length; i++) {
          const chunk :CarouselItem={
            Id: this.EventsData[i].Id,
            title: this.EventsData[i].type,
             image: `${this.apiUrl}/images/viewImage/${this.EventsData[i].tab}_${this.EventsData[i].tabId}.PNG`,
            // image: `https://ascomp.salesxceed.com:5000/api/images/viewImage/${this.EventsData[i].tab}_${this.EventsData[i].tabId}.PNG`,
            category: this.EventsData[i].tab,
            description:this.EventsData[i].description
          }
          this.allevents.push(chunk);
        }
        console.log(this.carouselSections);
        this.carouselSections.push({
            currentIndex: 0,
            items:this.allevents
          });
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }
  handleImgError(event: any) {
    if (!event.target.dataset.hasError) {
      event.target.dataset.hasError = "true"; // only once
      event.target.src = 'assets/default_events.PNG';
    }
  }

  prevSlide(section: CarouselSection): void {
    section.currentIndex = (section.currentIndex - 1 + section.items.length) % section.items.length;
  }

  nextSlide(section: CarouselSection): void {
    section.currentIndex = (section.currentIndex + 1) % section.items.length;
  }

  goToSlide(section: CarouselSection, index: number): void {
    section.currentIndex = index;
  }


  openPopup(item: any) {
    this.selectedItem = item;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedItem = null;
  }
  private startX = 0;
  private startY = 0;
  private threshold = 40; // minimum distance in px for swipe

  onPointerDown(event: PointerEvent,section:CarouselSection) {
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  onPointerUp(event: PointerEvent,section:CarouselSection) {
    const deltaX = event.clientX - this.startX;
    const deltaY = Math.abs(event.clientY - this.startY);

    // Ignore mostly vertical movement
    if (deltaY > 50) return;

    if (deltaX > this.threshold) {
      this.onSwipeRight(section);
    } else if (deltaX < -this.threshold) {
      this.onSwipeLeft(section);
    }
  }

  onSwipeLeft(section:CarouselSection) {
    this.prevSlide(section);
    console.log('Swiped Left!');
  }

  onSwipeRight(section:CarouselSection) {
    console.log('Swiped Right!');

    this.nextSlide(section);
  }
}
