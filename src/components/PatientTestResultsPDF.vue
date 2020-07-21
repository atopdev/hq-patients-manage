<template>
  <vue-html2pdf
    :show-layout="false"
    :preview-modal="false"
    :paginate-elements-by-height="1400"
    filename="patient_test_results"
    :pdf-quality="2"
    pdf-format="a4"
    pdf-orientation="landscape"
    pdf-content-width="100%"
    @progress="onProgress($event)"
    @hasStartedGeneration="hasStartedGeneration()"
    @hasGenerated="hasGenerated($event)"
    ref="html2Pdf"
  >
    <section slot="pdf-content">
      <!-- PDF Content Here -->
      <patient-test-results />
    </section>
  </vue-html2pdf>
</template>

<script>
import PatientTestResults from '@/components/PatientTestResults'
import VueHtml2pdf from 'vue-html2pdf'
export default {
  components: {
    VueHtml2pdf,
    PatientTestResults,
  },
  mounted() {
    this.generatePDF()
  },
  methods: {
    generatePDF() {
      this.$refs.html2Pdf.generatePdf()
    },
  },
}
</script>
