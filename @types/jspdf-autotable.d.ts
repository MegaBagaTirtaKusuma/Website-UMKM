// types/jspdf-autotable.d.ts

declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  declare module "jspdf" {
    interface jsPDF {
      autoTable: any; // Menambahkan properti autoTable ke dalam jsPDF
    }
  }
}
