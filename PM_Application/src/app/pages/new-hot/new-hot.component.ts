import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

interface CarouselItem {
name: any;
  id: number;
  image: string;
  title?: string;
}

interface CarouselSection {
  title: string;
  items: CarouselItem[];
  currentIndex: number;
}

@Component({
  selector: 'app-new-hot',
  templateUrl: './new-hot.component.html',
  styleUrls: ['./new-hot.component.css']
})
export class NewHotComponent implements OnInit, OnDestroy {
  // constructor(private cdr: ChangeDetectorRef) {}
  carouselSections: CarouselSection[] = [
    // {
    //   title: 'BACK IN STOCK',
    //   items: [
    //     { id: 1, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/BackInStock1.PNG' },
    //     { id: 2, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/BackInStock2.PNG' },
    //     { id: 3, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/BackInStock3.PNG' }
    //   ],
    //   currentIndex: 0
    // },
    // {
    //   title: 'TRENDING',
    //   items: [
    //     { id: 1, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending1.PNG' },
    //     { id: 2, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending2.PNG' },
    //     { id: 3, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending3.PNG' }
    //   ],
    //   currentIndex: 0
    // },
    // {
    //   title: 'NEWLY ADDED',
    //   items: [
    //     { id: 1, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending1.PNG' },
    //     { id: 2, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending1.PNG' },
    //     { id: 3, image: 'http://service.ireckoner.com:9898/purchase_manager/Images/Trending1.PNG' }
    //   ],
    //   currentIndex: 0
    // }
  ];
  newnhotData: any;
  itemdata:any;
  newnhotchamp: any[] = [];
  constructor(private authService: ApiService,private cdr: ChangeDetectorRef) {}

  private autoSlideInterval: any;

  ngOnInit(): void {
  this.startAutoSlide();
    this.loadnewnhotdata();
  }
  loadnewnhotdata(): void {
    this.authService.geteventsdata('NewnhotData').subscribe(
      (response) => {
         console.log('NewnhotData:', response);
      this.newnhotData = response[0].data;
      let allIds: number[] = [];
      for (let i = 0; i < this.newnhotData.length; i++) {
        const numbers = this.newnhotData[i].Id.split(',').map(Number);
        allIds = allIds.concat(numbers);
      }
      const result = allIds.join(',');
      console.log(result);
      this.authService.getItemname(result).subscribe(
        (response) => {
           console.log(response);
           this.itemdata=response;
      for (let i = 0; i < this.newnhotData.length; i++) {

       const idsArray = this.newnhotData[i].Id.split(',').map((id: string) => id.trim());
        const items = idsArray.map((id: any) => {
          // const match = this.itemdata.find((x:any) =>{x.ItemId == id} );
          const match= this.itemdata.find((x: any) => {
            return Number(x.ItemId) === Number(id);
          });

          return {
            id: Number(id),
            image: `https://cdn.ireckoner.in/00000101/Images/00000093/Item_${id}.PNG`,
            name: match ? match.ItemName : null
          };
        });
          this.carouselSections.push({
            title: this.newnhotData[i].type,
            items: items,
            currentIndex: 0
          });
        }
        console.log(this.carouselSections);

      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }
  handleImgError(event: any) {
    if (!event.target.dataset.hasError) {
      event.target.dataset.hasError = "true"; // only once
      event.target.src = 'assets/default_item.PNG';
    }
  }
  itemWidth = 120;
gap = 8;
containerWidth = 350;

computeTransform(index: number) {
  const itemSize = this.itemWidth + this.gap;

  // Where the center point should be
  const center = (this.containerWidth - this.itemWidth) / 2;

  // Slide to center the current item
  const offset = center - (index * itemSize);

  return `translateX(${offset}px)`;
}


  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
  // containerWidth = 350;       // total container width
// slideWidth = 140;
// centerOffset = (350 / 2) - (140 / 2);
  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.carouselSections.forEach(section => {
        this.nextSlide(section);
      });
    }, 5000);
  }

  nextSlide(section: CarouselSection): void {
    section.currentIndex = (section.currentIndex + 1) % section.items.length;
    this.cdr.detectChanges();
  }

  prevSlide(section: CarouselSection): void {
    section.currentIndex = (section.currentIndex - 1 + section.items.length) % section.items.length;
    this.cdr.detectChanges();
  }

  goToSlide(section: CarouselSection, index: number): void {
    section.currentIndex = index;
    this.cdr.detectChanges();
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
    this.nextSlide(section);
    console.log('Swiped Left!');
  }

  onSwipeRight(section:CarouselSection) {
    console.log('Swiped Right!');
    this.prevSlide(section);

  }



}
